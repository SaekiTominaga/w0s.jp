import ejs from 'ejs';
import filelist from 'filelist';
import fs from 'fs';
import hljs from 'highlight.js/lib/core';
import hljsCss from 'highlight.js/lib/languages/css';
import hljsJavaScript from 'highlight.js/lib/languages/javascript';
import hljsXml from 'highlight.js/lib/languages/xml';
import parse5 from 'parse5';
import path from 'path';
import posthtml from 'posthtml';
import posthtmlAnchorAmazonAssociate from 'posthtml-anchor-amazon-associate';
import posthtmlAnchorHost from 'posthtml-anchor-host';
import posthtmlTimeJapaneseDate from 'posthtml-time-japanese-date';
import prettier from 'prettier';
import xmlserializer from 'xmlserializer';
import xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';
import { exit } from 'node:process';

const filesPath = process.argv[2];
if (filesPath === undefined) {
	throw new Error('Missing parameter');
}

hljs.registerLanguage('xml', hljsXml);
hljs.registerLanguage('css', hljsCss);
hljs.registerLanguage('javascript', hljsJavaScript);
hljs.configure({
	classPrefix: 'c-code-highlight -',
});

const fileList = new filelist.FileList();
fileList.include(filesPath);

fileList.map(async (filePath) => {
	/* ファイル読み込み */
	const fileData = fs.readFileSync(filePath).toString();

	const filePathUrl = filePath.replace(/\\/g, '/');
	const fileUrl = filePathUrl.substring(filePathUrl.indexOf('/'));
	const fileName = path.basename(filePath);

	let pagePath = ''; // ページのルート相対パス
	if (fileName === 'index.html') {
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

	const document = new DOMParser().parseFromString(xmlserializer.serializeToString(parse5.parse(fileData)), 'text/html');
	const xpathSelect = xpath.useNamespaces({ x: 'http://www.w3.org/1999/xhtml' });

	/* HTML から必要なデータを取得 */
	const pageTitle = xpathSelect('string(//x:title)', document).toString(); // ページタイトル
	if (pageTitle === '') {
		console.error(`<title> 要素が存在しないか中身が空なため変換中止: ${filePath}`);
		exit();
	}

	const pageDescription = xpathSelect('string(//x:*[@itemprop="description"])', document)
		.toString()
		.trim()
		.split('\n')
		.map((value) => value.trim())
		.join(' ')
		.replace(/ +/g, ' '); // description

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
			views: ['views'],
		}
	);

	/* HTML コメント削除 */
	html = html.replace(/<!--[\s\S]*?-->/g, '');

	html = (
		await posthtml([
			/* 日付文字列を <time datetime> 要素に変換 */
			posthtmlTimeJapaneseDate({ element: 'span', class: 'htmlbuild-datetime' }),

			/* リンクアンカーにドメイン情報を付与 */
			posthtmlAnchorHost({
				class: 'htmlbuild-domain',
				host_element: 'b',
				host_class: 'c-domain',
				host_parentheses_before: '(',
				host_parentheses_after: ')',
			}),

			/* Amazon 商品ページのリンクにアソシエイトタグを追加 */
			posthtmlAnchorAmazonAssociate({
				class: 'htmlbuild-amazon-associate',
				associate_id: 'w0s.jp-22',
			}),
		]).process(html)
	).html;

	/**
	 * hightlight.js
	 *
	 * <code class="htmlbuild-highlight">&lt;span&gt;Hello World!&lt;/span&gt;</code>
	 * ↓
	 * <code data-language="xml">&lt;span&gt;Hello World!&lt;/span&gt;</code>
	 */
	html = html.replace(/<code([^>]*?)class="(.+? |)htmlbuild-highlight( .+?|)"([^>]*?)>([^]+?)<\/code[\s]*?>/g, (_match, p1, p2, p3, p4, p5) => {
		const attrsBefore = p1.trim(); // class 属性の前に指定されている属性
		const classValueBefore = p2.trim(); // htmlbuild-datetime の前方に指定された class 属性値
		const classValueAfter = p3.trim(); // htmlbuild-datetime の後方に指定された class 属性値
		const attrsAfter = p4.trim(); // class 属性の後に指定されている属性
		const textContent = p5; // 要素の中身

		const highlighted = hljs.highlightAuto(textContent.replaceAll('&lt;', '<').replaceAll('&gt;', '>'));

		const newClassValue = `${classValueBefore} ${classValueAfter}`.trim();

		let attr = '';
		if (attrsBefore !== '') {
			attr += ` ${attrsBefore}`;
		}
		if (newClassValue !== '') {
			attr += ` class="${newClassValue}"`;
		}
		if (attrsAfter !== '') {
			attr += ` ${attrsAfter}`;
		}
		if (attr === ' ') {
			attr = '';
		}
		if (highlighted.language !== undefined) {
			attr += ` data-language="${highlighted.language}"`;
		}

		return `<code${attr}>${highlighted.value}</code>`;
	});

	/* 整形 */
	let htmlFormatted = html;
	try {
		htmlFormatted = prettier.format(html, {
			/* https://prettier.io/docs/en/options.html */
			printWidth: 9999,
			useTabs: true,
			parser: 'html',
		});

		console.info(`フォーマット処理（prettier）完了: ${filePath}`);
	} catch (e) {
		console.error(`フォーマット処理（prettier）でエラー: ${filePath}`, e);
	}

	/* 出力 */
	const formatHTMLPath = `public/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;
	await fs.promises.writeFile(formatHTMLPath, htmlFormatted);
	console.info(`HTML ファイル出力: ${formatHTMLPath}`);
});
