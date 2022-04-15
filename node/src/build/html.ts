import ejs from 'ejs';
import filelist from 'filelist';
import fs from 'fs';
import hljs from 'highlight.js/lib/core';
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

			/* highlight.js */
			(tree: posthtml.Node): posthtml.Node => {
				hljs.registerLanguage('xml', hljsXml);
				hljs.registerLanguage('javascript', hljsJavaScript);
				hljs.configure({
					classPrefix: 'c-code-highlight -',
				});

				const targetElementInfo = {
					class: 'htmlbuild-highlight',
				};

				/**
				 * Narrowing by class name
				 *
				 * <p class="foo bar"> → <p class="foo bar"> (return false)
				 * <p class="foo TARGET bar"> → <p class="foo bar"> (return true)
				 *
				 * @param {object} node - Target node
				 * @param {string} targetClassName - Searches if the target node contains this class name
				 *
				 * @returns {boolean} Whether the target node contains the specified class name
				 */
				const narrowingClass = (node: posthtml.Node, targetClassName: string): boolean => {
					const attrs = node.attrs;

					if (attrs?.class === undefined) {
						/* class 属性がない場合 */
						return false;
					}

					const classList = attrs.class.trim().split(/[\t\n\f\r ]+/g);
					if (!classList.includes(targetClassName)) {
						/* 当該クラス名がない場合 */
						return false;
					}

					/* 指定されたクラス名を除去した上で変換する */
					const newClass = classList.filter((className) => className !== targetClassName && className !== '').join(' ');
					attrs.class = newClass !== '' ? newClass : undefined;

					return true;
				};

				const highlightNode = (node: posthtml.Node) => {
					const content = node.content;
					const attrs = node.attrs ?? {};

					if (!narrowingClass(node, targetElementInfo.class)) {
						return node;
					}

					const languageName = attrs['data-language'];
					let registLanguageName: string | undefined;
					switch (languageName) {
						case 'xml':
						case 'html':
						case 'svg': {
							registLanguageName = 'xml';
							break;
						}
						case 'javascript': {
							registLanguageName = 'javascript';
							break;
						}
						default: {
							console.warn(`無効な言語名: \`${languageName}\``);
						}
					}

					if (content?.length !== 1) {
						/* TODO: 当該 <code> の中は Text ノードのみ（length === 1）の想定 */
						return node;
					}

					const codeText = content.at(0)?.toString().replaceAll('&lt;', '<').replaceAll('&gt;', '>');
					if (codeText === undefined) {
						return node;
					}

					const highlighted = registLanguageName !== undefined ? hljs.highlight(codeText, { language: registLanguageName }) : hljs.highlightAuto(codeText);

					node.content = [highlighted.value];

					return node;
				};

				tree.match({ tag: 'code' }, highlightNode);

				return tree;
			},
		]).process(html)
	).html;

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
