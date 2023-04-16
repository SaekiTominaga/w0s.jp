import dayjs from 'dayjs';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import slash from 'slash';
import { globby } from 'globby';
import { JSDOM } from 'jsdom';
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
import HtmlComponentToc from './component/HtmlToc.js';
import HtmlCpmponentSectioningId from './component/HtmlSectioningId.js';
import PageUrl from '../util/PageUrl.js';
import PrettierUtil from '../util/PrettierUtil.js';

interface StructuredDataUrl {
	path: string;
	name: string;
}

interface StructuredData {
	'@type': string;
	title: string;
	headline?: string;
	subHeadline?: string;
	dateModified?: string;
	description?: string;
	image?: string;
	breadcrumb?: StructuredDataUrl[];
	localNav?: StructuredDataUrl[];
}

interface StructuredDataView extends StructuredData {
	dateModifiedDayjs?: dayjs.Dayjs;
}

interface SchemaOrgBreadcrumbListItem {
	'@context'?: string;
	'@type': string;
	position: number;
	name: string;
	item?: string;
} // https://schema.org/ListItem; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb?hl=ja#list-item

interface SchemaOrgBreadcrumbList {
	'@context'?: string;
	'@type': string;
	itemListElement: SchemaOrgBreadcrumbListItem[];
} // https://schema.org/BreadcrumbList; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb?hl=ja#breadcrumb-list

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

		const prettierOptions = PrettierUtil.configOverrideAssign(await PrettierUtil.loadConfig(this.configBuild.prettier.config), '*.html');

		fileList.forEach(async (filePath) => {
			/* ファイル読み込み */
			const fileData = (await fs.promises.readFile(filePath)).toString();

			/* HTML から必要なデータを取得 */
			const structuredElement = new JSDOM(fileData).window.document.querySelector(this.configBuild.html.structured_selector); // 構造データ
			const structuredText = structuredElement?.textContent;
			if (structuredText === null || structuredText === undefined) {
				this.logger.error(`Structured data is not defined: ${filePath}`);
				return;
			}
			const structured: StructuredData = JSON.parse(structuredText);

			const publicFilePath = filePath.replaceAll(new RegExp(`^${this.configBuild.html.directory}`, 'g'), this.configCommon.static.root);

			const pageUrl = new PageUrl({
				root: this.configCommon.static.root,
				indexes: this.configCommon.static.indexes,
				extensions: [path.extname(filePath).replace('.', '')],
			});

			this.logger.debug(pageUrl.getUrl(publicFilePath));

			/* EJS を解釈 */
			const html = await ejs.renderFile(
				path.resolve(filePath),
				{
					pagePathAbsoluteUrl: pageUrl.getUrl(publicFilePath), // U+002F (/) から始まるパス絶対 URL
					filePath: filePath,
					structuredData: {
						title: structured.title,
						headline: structured.headline,
						subHeadline: structured.subHeadline,
						dateModifiedDayjs: structured.dateModified !== undefined ? dayjs(structured.dateModified) : undefined,
						description: structured.description,
						image: structured.image,
						breadcrumb: structured.breadcrumb,
						localNav: structured.localNav,
					} as StructuredDataView,
					jsonLd: Html.getJsonLd(structured),
				},
				{
					views: [this.configCommon.views],
				}
			);

			/* HTML コメント削除 */
			const htmlCommentOmitted = html.replace(/<!--[\s\S]*?-->/g, '');

			const dom = new JSDOM(htmlCommentOmitted);
			const { document } = dom.window;

			document.querySelector(this.configBuild.html.structured_selector)?.remove();
			const contentMain = document.querySelector(this.configBuild.html.main_selector);
			if (contentMain === null) {
				this.logger.error(`Main area is not exist: ${filePath}`);
				return;
			}

			/* OGP */
			if (document.querySelector('meta[property^="og:"]') !== null) {
				document.documentElement.setAttribute('prefix', 'og: http://ogp.me/ns#');
			}

			const { views } = this.configBuild.html;

			/* ステップ1: セクショニングコンテンツや見出しを生成する処理 */
			await Promise.all([
				new HtmlComponentBook(document, views).convert(this.configBuild.html.book, this.configBuild.html.heading_self_link.target_class), // 書籍
				new HtmlComponentNewspaper(document, views).convert(this.configBuild.html.newspaper, this.configBuild.html.heading_self_link.target_class), // 新聞
			]);

			/* ステップ2: セクショニングコンテンツや見出しを利用する処理 */
			new HtmlCpmponentSectioningId(document, views).convert({
				sectioning_area: contentMain,
				heading_levels: this.configBuild.html.section_id.heading_levels,
			}); // セクション ID 自動生成

			/* ステップ3: その他の処理 */
			await Promise.all([
				new HtmlComponentAnchorIcon(document, views).convert({
					type: this.configBuild.html.anchor_type,
					host: this.configBuild.html.anchor_host,
				}), // リンクアンカーに付随するアイコンを付与
				new HtmlComponentFootnote(document, views).convert(this.configBuild.html.footnote), // 注釈
				new HtmlComponentHeadingSelfLink(document, views).convert(this.configBuild.html.heading_self_link), // 見出しにセルフリンクを挿入
				new HtmlComponentToc(document, views).convert({
					target_element: this.configBuild.html.toc.target_element,
					sectioning_area: contentMain,
				}), // 目次自動生成

				new HtmlComponentAnchorAmazonAssociate(document, views).convert({
					target_class: this.configBuild.html.anchor_amazon_associate.target_class,
					associate_id: this.configCommon.paapi.request.partner_tag,
				}), // Amazon 商品ページのリンクにアソシエイトタグを追加
				new HtmlComponentHighlight(document, views).convert(this.configBuild.html.highlight), // highlight.js
				new HtmlComponentImage(document, views).convert(this.configBuild.html.image), // `<picture>` 要素を使って複数フォーマットの画像を提供する
				new HtmlComponentImageAmazon(document, views).convert(this.configBuild.html.image_amazon), // Amazon 商品画像
				new HtmlComponentTimeJapaneseDate(document, views).convert(this.configBuild.html.time), // 日付文字列を `<time datetime>` 要素に変換
			]);

			const htmlBuilt = dom.serialize();
			this.logger.info(`Build finished: ${filePath}`);

			/* 整形 */
			let htmlFormatted = htmlBuilt;
			try {
				htmlFormatted = prettier.format(htmlBuilt, prettierOptions);

				this.logger.info(`Prettier finished: ${filePath}`);
			} catch (e) {
				this.logger.error(`Prettier error: ${filePath}`, e);
			}

			/* 出力 */
			const distPathParse = path.parse(`${this.configCommon.static.root}/${filePath.substring(filePath.indexOf('/') + 1)}`);
			const distPath = `${distPathParse.dir}/${distPathParse.name}.html`;
			await fs.promises.writeFile(distPath, htmlFormatted);
			this.logger.info(`HTML file created: ${distPath}`);
		});
	}

	/**
	 * JSON-LD 用のデータを構築
	 *
	 * @param {object} structured - ページで指定された構造データ
	 *
	 * @returns {object} JSON-LD データ
	 */
	static getJsonLd(structured: StructuredData): SchemaOrgBreadcrumbList | undefined {
		if (structured.breadcrumb === undefined) {
			return undefined;
		}

		const jsonLdBreadcrumbItemList: SchemaOrgBreadcrumbListItem[] = structured.breadcrumb.map((item, index) => {
			const listItem = {
				'@type': 'ListItem',
				position: index + 1,
				name: item.name,
				item: `https://w0s.jp${item.path}`, // 絶対 URL 化
			};
			return listItem;
		});
		jsonLdBreadcrumbItemList.push({
			'@type': 'ListItem',
			position: jsonLdBreadcrumbItemList.length + 1,
			name: structured.title,
		}); // 最後に現在ページを追加

		const jsonLd: SchemaOrgBreadcrumbList = {
			'@context': 'https://schema.org/',
			'@type': 'BreadcrumbList',
			itemListElement: jsonLdBreadcrumbItemList,
		};

		return jsonLd;
	}
}
