import ejs from 'ejs';
import filelist from 'filelist';
import fs from 'fs';
import HtmlComponentAnchorAmazonAssociate from './component/HtmlAnchorAmazonAssociate.js';
import HtmlComponentAnchorHost from './component/HtmlAnchorHost.js';
import HtmlComponentAnchorType from './component/HtmlAnchorType.js';
import HtmlComponentBook from './component/HtmlBook.js';
import HtmlComponentHeadingAnchor from './component/HtmlHeadingAnchor.js';
import HtmlComponentHighlight from './component/HtmlHighlight.js';
import HtmlComponentImage from './component/HtmlImage.js';
import HtmlComponentNewspaper from './component/HtmlNewspaper.js';
import HtmlComponentTimeJapaneseDate from './component/HtmlTimeJapaneseDate.js';
import HtmlComponentToc from './component/HtmlToc.js';
import HtmlCpmponentLocalnav from './component/HtmlLocalnav.js';
import HtmlCpmponentSectionId from './component/HtmlSectionId.js';
import path from 'path';
import prettier from 'prettier';
import { JSDOM } from 'jsdom';
import { NoName as Configure } from '../../configure/type/build';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';

/* 設定ファイル読み込み */
const configCommon = <ConfigureCommon>JSON.parse(fs.readFileSync('node/configure/common.json', 'utf8'));
const config = <Configure>JSON.parse(fs.readFileSync('node/configure/build.json', 'utf8'));

const filesPath = process.argv[2];
if (filesPath === undefined) {
	throw new Error('Missing parameter');
}

const fileList = new filelist.FileList();
fileList.include(filesPath);

fileList.map(async (filePath) => {
	/* ファイル読み込み */
	const fileData = (await fs.promises.readFile(filePath)).toString();

	const filePathUrl = filePath.replace(/\\/g, '/');
	const fileUrl = filePathUrl.substring(filePathUrl.indexOf('/'));
	const fileName = path.basename(filePath);

	let pagePath = ''; // ページのルート相対パス
	if (configCommon.static.indexes?.includes(fileName)) {
		/* ファイル名が index.html の場合は省略する */
		pagePath = path.dirname(fileUrl);
		if (pagePath !== '/') {
			pagePath += '/';
		}
	} else {
		/* 拡張子を除去する */
		const parse = path.parse(fileUrl);
		pagePath = parse.dir !== '/' ? `${parse.dir}/${parse.name}` : `/${parse.name}`;
	}

	const documentEjs = new JSDOM(fileData).window.document;

	/* HTML から必要なデータを取得 */
	const pageTitle = documentEjs.querySelector('title')?.textContent ?? ''; // ページタイトル

	const pageDescription = documentEjs
		.querySelector('[itemprop="description"]')
		?.textContent?.trim()
		.split('\n')
		.map((value) => value.trim())
		.join(' '); // Description

	/* EJS を解釈 */
	const html = await ejs.renderFile(
		path.resolve(filePath),
		{
			page: {
				path: pagePath,
				title: pageTitle,
				description: pageDescription,
			},
		},
		{
			views: [configCommon.views],
		}
	);

	/* HTML コメント削除 */
	const htmlCommentOmitted = html.replace(/<!--[\s\S]*?-->/g, '');

	const dom = new JSDOM(htmlCommentOmitted);
	const document = dom.window.document;

	const contentMain = document.querySelector('.l-content__main');
	const contentHeader = document.querySelector('.l-content__header');
	const contentFooter = document.querySelector('.l-content__footer');

	new HtmlComponentBook(document).convert(config.html.book, config.html.heading_anchor.target_class); // 書籍
	new HtmlComponentNewspaper(document).convert(config.html.newspaper, config.html.heading_anchor.target_class); // 新聞

	if (contentMain !== null) {
		new HtmlCpmponentSectionId(document).convert({
			section_area: contentMain,
			heading_levels: config.html.section_id.heading_levels,
		}); // セクション ID 自動生成
		new HtmlComponentToc(document).convert({
			target_element: config.html.toc.target_element,
			section_area: contentMain,
			class: config.html.toc.class,
			label: config.html.toc.label,
		}); // 目次自動生成
	}
	if (contentHeader !== null) {
		new HtmlCpmponentLocalnav(document).convert({
			target_class: config.html.localnav.target_class,
			header_area: contentHeader,
			footer_area: contentFooter,
		}); // コンテンツヘッダーのローカルナビをコンテンツフッターにコピーする
	}

	new HtmlComponentAnchorType(document).convert(config.html.anchor_type); // リンクアンカーにリソースタイプアイコンを付与
	new HtmlComponentAnchorHost(document).convert(config.html.anchor_host); // リンクアンカーにドメイン情報を付与
	new HtmlComponentAnchorAmazonAssociate(document).convert({
		target_class: config.html.anchor_amazon_associate.target_class,
		associate_id: configCommon.paapi.request.partner_tag,
	}); // Amazon 商品ページのリンクにアソシエイトタグを追加
	new HtmlComponentHeadingAnchor(document).convert(config.html.heading_anchor); // 見出しにセルフリンクを挿入
	new HtmlComponentTimeJapaneseDate(document).convert(config.html.time); // 日付文字列を `<time datetime>` 要素に変換
	new HtmlComponentImage(document).convert(config.html.image); // `<picture>` 要素を使って複数フォーマットの画像を提供する
	new HtmlComponentHighlight(document).convert(config.html.highlight); // highlight.js

	const htmlBuilt = dom.serialize();

	/* 整形 */
	let htmlFormatted = htmlBuilt;
	try {
		htmlFormatted = prettier.format(htmlBuilt, {
			/* https://prettier.io/docs/en/options.html */
			printWidth: 9999,
			useTabs: true,
			parser: 'html',
		});

		console.info(`Prettier finished: ${filePath}`);
	} catch (e) {
		console.error(`Prettier error: ${filePath}`, e);
	}

	/* 出力 */
	const distPath = `${configCommon.static.root}/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;
	await fs.promises.writeFile(distPath, htmlFormatted);
	console.info(`HTML file created: ${distPath}`);
});
