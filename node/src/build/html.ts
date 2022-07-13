import ejs from 'ejs';
import filelist from 'filelist';
import fs from 'fs';
import GithubSlugger from 'github-slugger';
import HtmlComponentAnchorAmazonAssociate from './component/HtmlAnchorAmazonAssociate.js';
import HtmlComponentAnchorHost from './component/HtmlAnchorHost.js';
import HtmlComponentAnchorType from './component/HtmlAnchorType.js';
import HtmlComponentBook from './component/HtmlBook.js';
import HtmlComponentHeadingAnchor from './component/HtmlHeadingAnchor.js';
import HtmlComponentHighlight from './component/HtmlHighlight.js';
import HtmlComponentImage from './component/HtmlImage.js';
import HtmlComponentNewspaper from './component/HtmlNewspaper.js';
import HtmlComponentTimeJapaneseDate from './component/HtmlTimeJapaneseDate.js';
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
	let html = await ejs.renderFile(
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
	html = html.replace(/<!--[\s\S]*?-->/g, '');

	const dom = new JSDOM(html);
	const document = dom.window.document;

	const contentMain = document.querySelector('.l-content__main');

	new HtmlComponentBook(document).convert(config.html.book, config.html.heading_anchor.target_class); // 書籍
	new HtmlComponentNewspaper(document).convert(config.html.newspaper, config.html.heading_anchor.target_class); // 新聞

	if (contentMain !== null) {
		/* セクション ID 自動生成 */
		const slugger = new GithubSlugger();

		for (const section of contentMain.querySelectorAll('article, section')) {
			const headingText = section.querySelector('h2, h3, h4')?.textContent;
			if (headingText === null || headingText === undefined) {
				continue;
			}

			section.id = slugger.slug(section.id !== '' ? section.id : headingText);
		}
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

	if (contentMain !== null) {
		const contentHeader = document.querySelector('.l-content__header');
		let contentFooter = document.querySelector('.l-content__footer');

		/* 目次自動生成 */
		const toc = contentHeader?.querySelector('.p-toc');
		if (toc !== null && toc !== undefined) {
			const data: Map<string, string> = new Map();
			for (const section of contentMain.querySelectorAll('section[id]')) {
				const str = section.querySelector('h2')?.textContent;
				if (str === null || str === undefined) {
					continue;
				}

				data.set(section.id, str);
			}

			if (data.size >= 2) {
				toc.setAttribute('aria-label', '目次');
				for (const [id, str] of data) {
					const a = document.createElement('a');
					a.href = `#${encodeURIComponent(id)}`;
					a.textContent = str;

					const li = document.createElement('li');
					li.appendChild(a);

					toc.appendChild(li);
				}
			} else {
				console.info('見出しレベル 2 が 1 つなので目次は表示しない', data);
				toc.remove();
			}
		}

		/* ローカルナビはコンテンツヘッダーとコンテンツフッターの2か所に表示 */
		const localNavHeader = contentHeader?.querySelector('.p-local-nav');
		if (localNavHeader !== null && localNavHeader !== undefined) {
			if (contentFooter === null) {
				contentFooter = document.createElement('div');
				contentFooter.className = 'l-content__footer';
				contentMain.insertAdjacentElement('afterend', contentFooter);
			}

			const localNavFooter = <Element>localNavHeader.cloneNode(true);
			localNavFooter.removeAttribute('id');
			contentFooter.insertAdjacentElement('beforeend', localNavFooter);
		}
	}

	html = dom.serialize();

	/* 整形 */
	let htmlFormatted = html;
	try {
		htmlFormatted = prettier.format(html, {
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
