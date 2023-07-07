import fs from 'node:fs';
import path from 'node:path';
import ejs from 'ejs';
import prettier from 'prettier';
import slash from 'slash';
import { globby } from 'globby';
import { JSDOM } from 'jsdom';
import HtmlStructuredData from '@w0s.jp/util/dist/HtmlStructuredData.js';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';
import HtmlComponentAnchorAmazonAssociate from './component/HtmlAnchorAmazonAssociate.js';
import HtmlComponentAnchorIcon from './component/HtmlAnchorIcon.js';
import HtmlComponentBook from './component/HtmlBook.js';
import HtmlComponentFootnote from './component/HtmlFootnote.js';
import HtmlComponentHeadingSelfLink from './component/HtmlHeadingSelfLink.js';
import HtmlComponentHighlight from './component/HtmlHighlight.js';
import HtmlComponentImage from './component/HtmlImage.js';
import HtmlComponentImageAmazon from './component/HtmlImageAmazon.js';
import HtmlComponentNewspaper from './component/HtmlNewspaper.js';
import HtmlComponentTimeJapaneseDate from './component/HtmlTimeJapaneseDate.js';
import HtmlCpmponentSectioningId from './component/HtmlSectioningId.js';
import PageUrl from '../util/PageUrl.js';
import PrettierUtil from '../util/PrettierUtil.js';

/**
 * HTML ビルド
 */
export default class Html extends BuildComponent implements BuildComponentInterface {
	async execute(args: string[]): Promise<void> {
		const filesPathOs = args.at(0);
		if (filesPathOs === undefined) {
			throw new Error('Missing parameter');
		}
		const filesPath = slash(filesPathOs);

		const fileList = await globby(filesPath);

		const prettierOptions = PrettierUtil.configOverrideAssign(await PrettierUtil.loadConfig(this.config.prettier.config), '*.html');

		await Promise.all(
			fileList.map(async (filePath) => {
				const publicFileParse = path.parse(filePath.replace(new RegExp(`^${this.config.html.directory}`), this.config.static.root));
				const publicFilePath = `${publicFileParse.dir}/${publicFileParse.name}.html`;

				const pageUrl = new PageUrl({
					root: this.config.static.root,
					indexes: this.config.static.indexes,
					extensions: this.config.static.extensions,
				});

				const [fileData, structuredData] = await Promise.all([
					fs.promises.readFile(filePath), // HTML
					HtmlStructuredData.getForJson(filePath), // 構造データ
				]);

				/* HTML コメント削除 */
				const fileDataCommentOmitted = fileData.toString().replace(/<!--[\s\S]*?-->/g, '');

				/* DOM 化 */
				const { document } = new JSDOM(fileDataCommentOmitted).window;

				const { views } = this.config.html;

				/* ステップ1: セクショニングコンテンツや見出しを生成する処理 */
				await Promise.all([
					new HtmlComponentBook(document, views).convert(this.config.html.book, this.config.html.heading_self_link.target_class), // 書籍
					new HtmlComponentNewspaper(document, views).convert(this.config.html.newspaper, this.config.html.heading_self_link.target_class), // 新聞
				]);

				/* ステップ2: セクショニングコンテンツや見出しを利用する処理 */
				new HtmlCpmponentSectioningId(document, views).convert({
					heading_levels: this.config.html.section_id.heading_levels,
				}); // セクション ID 自動生成

				/* ステップ3: 要素の置換・移動などでその他の処理に影響を及ぼす処理 */
				await Promise.all([
					new HtmlComponentFootnote(document, views).convert(this.config.html.footnote), // 脚注
				]);

				/* ステップ4: その他の処理 */
				await Promise.all([
					new HtmlComponentAnchorIcon(document, views).convert({
						type: this.config.html.anchor_type,
						host: this.config.html.anchor_host,
					}), // リンクアンカーに付随するアイコンを付与
					new HtmlComponentHeadingSelfLink(document, views).convert(this.config.html.heading_self_link), // 見出しにセルフリンクを挿入

					new HtmlComponentAnchorAmazonAssociate(document, views).convert({
						target_class: this.config.html.anchor_amazon_associate.target_class,
						associate_id: this.config.paapi.partner_tag,
					}), // Amazon 商品ページのリンクにアソシエイトタグを追加
					new HtmlComponentHighlight(document, views).convert(this.config.html.highlight), // highlight.js
					new HtmlComponentImage(document, views).convert(this.config.html.image), // `<picture>` 要素を使って複数フォーマットの画像を提供する
					new HtmlComponentImageAmazon(document, views).convert(this.config.html.image_amazon), // Amazon 商品画像
					new HtmlComponentTimeJapaneseDate(document, views).convert(this.config.html.time), // 日付文字列を `<time datetime>` 要素に変換
				]);

				/* 目次自動生成 */
				const toc: Map<string, string> = new Map();
				if (structuredData.template.toc === undefined || structuredData.template.toc) {
					document.querySelectorAll('article[id], section[id]').forEach((sectioningElement) => {
						const headingText = sectioningElement.querySelector('h2')?.textContent;
						if (headingText === null || headingText === undefined) {
							return;
						}

						toc.set(sectioningElement.id, headingText);
					});
				}

				/* EJS を解釈 */
				const htmlBuilt = await ejs.renderFile(`${this.config.views}/${structuredData.template.name}.ejs`, {
					pagePathAbsoluteUrl: pageUrl.getUrl(publicFilePath), // U+002F (/) から始まるパス絶対 URL
					filePath: path.normalize(`package/frontend/${filePath}`).replaceAll('\\', '/'),
					structuredData: structuredData,
					jsonLd: HtmlStructuredData.getJsonLd(structuredData),
					main: document.body.innerHTML,
					toc: toc,
				});
				console.info(`Build finished: ${filePath}`);

				/* 整形 */
				let htmlFormatted = htmlBuilt;
				try {
					htmlFormatted = await prettier.format(htmlBuilt, prettierOptions);

					console.info(`Prettier finished: ${filePath}`);
				} catch (e) {
					console.error(`Prettier error: ${filePath}`, e);
				}

				/* 出力 */
				await fs.promises.writeFile(publicFilePath, htmlFormatted);
				console.info(`HTML file created: ${publicFilePath}`);
			}),
		);
	}
}
