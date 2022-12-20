import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { globby } from 'globby';
import { JSDOM } from 'jsdom';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';
import HtmlComponentAnchorAmazonAssociate from './component/HtmlAnchorAmazonAssociate.js';
import HtmlComponentAnchorHost from './component/HtmlAnchorHost.js';
import HtmlComponentAnchorType from './component/HtmlAnchorType.js';
import HtmlComponentBook from './component/HtmlBook.js';
import HtmlComponentFootnote from './component/HtmlFootnote.js';
import HtmlComponentHeadingSelfLink from './component/HtmlHeadingSelfLink.js';
import HtmlComponentHighlight from './component/HtmlHighlight.js';
import HtmlComponentImage from './component/HtmlImage.js';
import HtmlComponentImageAmazon from './component/HtmlImageAmazon.js';
import HtmlComponentNewspaper from './component/HtmlNewspaper.js';
import HtmlComponentTimeJapaneseDate from './component/HtmlTimeJapaneseDate.js';
import HtmlComponentToc from './component/HtmlToc.js';
import HtmlCpmponentLocalnav from './component/HtmlLocalnav.js';
import HtmlCpmponentSectioningId from './component/HtmlSectioningId.js';
import PageUrl from '../util/PageUrl.js';

/**
 * HTML ビルド
 */
export default class Html extends BuildComponent implements BuildComponentInterface {
	async execute(args: string[]): Promise<void> {
		const filesPath = args.at(0);
		if (filesPath === undefined) {
			throw new Error('Missing parameter');
		}

		const fileList = await globby(filesPath.replace(/\\/g, '/'));

		fileList.forEach(async (filePath) => {
			/* ファイル読み込み */
			const fileData = (await fs.promises.readFile(filePath)).toString();
			const documentEjs = new JSDOM(fileData).window.document;

			/* HTML から必要なデータを取得 */
			const pageTitle = documentEjs.querySelector('title')?.textContent ?? ''; // ページタイトル

			const pageDescription = documentEjs
				.querySelector('[itemprop="description"]')
				?.textContent?.trim()
				.split('\n')
				.map((value) => value.trim())
				.join(' '); // Description

			let pageImage: string | undefined; // image
			const schemaThumbnailUrl = documentEjs.querySelector('[itemprop="thumbnailUrl"]')?.getAttribute('src')?.trim();
			if (schemaThumbnailUrl?.startsWith('https://media.w0s.jp/thumbimage/')) {
				const url = new URL(schemaThumbnailUrl);
				pageImage = `${url.origin}${url.pathname.replace(/^\/thumbimage\//, '/image/')}`;
			}

			const publicFilePath = filePath.replaceAll(new RegExp(`^${this.configBuild.html.directory}`, 'g'), this.configCommon.static.root);

			const pageUrl = new PageUrl({
				root: this.configCommon.static.root,
				indexes: this.configCommon.static.indexes,
				extensions: this.configCommon.static.extensions,
			});

			const urlPath = pageUrl.getUrl(publicFilePath);

			/* EJS を解釈 */
			const html = await ejs.renderFile(
				path.resolve(filePath),
				{
					page: {
						path: urlPath,
						title: pageTitle,
						description: pageDescription,
						image: pageImage,
					},
					file: filePath,
				},
				{
					views: [this.configCommon.views],
				}
			);

			/* HTML コメント削除 */
			const htmlCommentOmitted = html.replace(/<!--[\s\S]*?-->/g, '');

			const dom = new JSDOM(htmlCommentOmitted);
			const { document } = dom.window;

			const contentMain = document.querySelector('.l-content__main');
			const contentHeader = document.querySelector('.l-content__header');
			const contentFooter = document.querySelector('.l-content__footer');

			/* OGP */
			if (document.querySelector('meta[property^="og:"]') !== null) {
				document.documentElement.setAttribute('prefix', 'og: http://ogp.me/ns#');
			}

			new HtmlComponentBook(document).convert(this.configBuild.html.book, this.configBuild.html.heading_self_link.target_class); // 書籍
			new HtmlComponentNewspaper(document).convert(this.configBuild.html.newspaper, this.configBuild.html.heading_self_link.target_class); // 新聞

			if (contentMain !== null) {
				new HtmlCpmponentSectioningId(document).convert({
					sectioning_area: contentMain,
					heading_levels: this.configBuild.html.section_id.heading_levels,
				}); // セクション ID 自動生成
				new HtmlComponentToc(document).convert({
					target_element: this.configBuild.html.toc.target_element,
					sectioning_area: contentMain,
					class: this.configBuild.html.toc.class,
					label: this.configBuild.html.toc.label,
				}); // 目次自動生成
			}
			if (contentHeader !== null) {
				new HtmlCpmponentLocalnav(document).convert({
					target_class: this.configBuild.html.localnav.target_class,
					header_area: contentHeader,
					footer_area: contentFooter,
				}); // コンテンツヘッダーのローカルナビをコンテンツフッターにコピーする
			}

			new HtmlComponentFootnote(document).convert(this.configBuild.html.footnote); // 注釈
			new HtmlComponentAnchorType(document).convert(this.configBuild.html.anchor_type); // リンクアンカーにリソースタイプアイコンを付与
			new HtmlComponentAnchorHost(document).convert(this.configBuild.html.anchor_host); // リンクアンカーにドメイン情報を付与
			new HtmlComponentAnchorAmazonAssociate(document).convert({
				target_class: this.configBuild.html.anchor_amazon_associate.target_class,
				associate_id: this.configCommon.paapi.request.partner_tag,
			}); // Amazon 商品ページのリンクにアソシエイトタグを追加
			new HtmlComponentHeadingSelfLink(document).convert(this.configBuild.html.heading_self_link); // 見出しにセルフリンクを挿入
			new HtmlComponentTimeJapaneseDate(document).convert(this.configBuild.html.time); // 日付文字列を `<time datetime>` 要素に変換
			new HtmlComponentImage(document).convert(this.configBuild.html.image); // `<picture>` 要素を使って複数フォーマットの画像を提供する
			new HtmlComponentImageAmazon(document).convert(this.configBuild.html.image_amazon); // Amazon 商品画像
			new HtmlComponentHighlight(document).convert(this.configBuild.html.highlight); // highlight.js

			const htmlBuilt = dom.serialize();
			this.logger.info(`Build finished: ${filePath}`);

			/* 整形 */
			let htmlFormatted = htmlBuilt;
			try {
				htmlFormatted = prettier.format(htmlBuilt, {
					/* https://prettier.io/docs/en/options.html */
					printWidth: 9999,
					useTabs: true,
					parser: 'html',
				});

				this.logger.info(`Prettier finished: ${filePath}`);
			} catch (e) {
				this.logger.error(`Prettier error: ${filePath}`, e);
			}

			/* 出力 */
			const distPath = `${this.configCommon.static.root}/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;
			await fs.promises.writeFile(distPath, htmlFormatted);
			this.logger.info(`HTML file created: ${distPath}`);
		});
	}
}