import Convert from './dom/Convert.js';
import ejs from 'ejs';
import filelist from 'filelist';
import fs from 'fs';
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

	const contentHeader = document.querySelector('.l-content__header');
	const contentMain = document.querySelector('.l-content__main');
	if (contentHeader !== null && contentMain !== null) {
		let contentFooter = document.querySelector('.l-content__footer');

		/* 目次自動生成 */
		const toc = contentHeader.querySelector('.p-toc');
		if (toc !== null) {
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
					a.href = `#${id}`;
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
		const localNavHeader = contentHeader.querySelector('.p-local-nav');
		if (localNavHeader !== null) {
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

	const convert = new Convert(document);
	convert.anchorType(config.html.anchor_type); // リンクアンカーにリソースタイプアイコンを付与
	convert.anchorHost(config.html.anchor_host); // リンクアンカーにドメイン情報を付与
	convert.anchorAmazonAssociate({
		target_class: config.html.anchor_amazon_associate.target_class,
		associate_id: configCommon.paapi.request.partner_tag,
	}); // Amazon 商品ページのリンクにアソシエイトタグを追加
	convert.timeJapaneseDate(config.html.time); // 日付文字列を `<time datetime>` 要素に変換
	convert.image(config.html.image); // `<picture>` 要素を使って複数フォーマットの画像を提供する
	convert.highlight(config.html.highlight); // highlight.js

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
