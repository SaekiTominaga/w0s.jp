import ejs from 'ejs';
import filelist from 'filelist';
import fs from 'fs';
import hljs from 'highlight.js/lib/core';
import hljsJavaScript from 'highlight.js/lib/languages/javascript';
import hljsXml from 'highlight.js/lib/languages/xml';
import path from 'path';
import posthtml from 'posthtml';
import posthtmlAnchorAmazonAssociate from 'posthtml-anchor-amazon-associate';
import posthtmlAnchorHost from 'posthtml-anchor-host';
import posthtmlAnchorIcon from 'posthtml-anchor-icon';
import posthtmlImage from 'posthtml-w0s.jp-image';
import PosthtmlMatchClass from '@saekitominaga/posthtml-match-class';
import posthtmlTimeJapaneseDate from 'posthtml-time-japanese-date';
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

	html = dom.serialize();

	html = (
		await posthtml([
			/* リンクアンカーにドメイン情報を付与 */
			posthtmlAnchorHost({
				class: config.html.anchor_host.class,
				host_element: config.html.anchor_host.host_element,
				host_class: config.html.anchor_host.host_class,
				host_parentheses_before: config.html.anchor_host.host_parentheses_before,
				host_parentheses_after: config.html.anchor_host.host_parentheses_after,
			}),

			/* リンクアンカーにアイコンを付与 */
			posthtmlAnchorIcon({
				class: config.html.anchor_icon.class,
				host_info: config.html.anchor_icon.host_info,
				icon_class: config.html.anchor_icon.icon_class,
				icon_size: config.html.anchor_icon.icon_size,
				icon_parentheses_before: config.html.anchor_icon.icon_parentheses_before,
				icon_parentheses_after: config.html.anchor_icon.icon_parentheses_after,
			}),

			/* Amazon 商品ページのリンクにアソシエイトタグを追加 */
			posthtmlAnchorAmazonAssociate({
				class: config.html.anchor_amazon_associate.class,
				associate_id: configCommon.paapi.request.partner_tag,
			}),

			/* 日付文字列を <time datetime> 要素に変換 */
			posthtmlTimeJapaneseDate({ element: config.html.time.element, class: config.html.time.class }),

			/* <picture> 要素を使って複数フォーマットの画像を提供する */
			posthtmlImage({ class: config.html.image.class }),

			/* highlight.js */
			(tree: posthtml.Node): posthtml.Node => {
				hljs.registerLanguage('xml', hljsXml);
				hljs.registerLanguage('javascript', hljsJavaScript);
				hljs.configure({
					classPrefix: config.html.highlight.htmlbuild_class_prefix,
				});

				const targetElementInfo = {
					class: config.html.highlight.class,
				};

				tree.match({ tag: 'code' }, (node: posthtml.Node) => {
					const content = node.content;
					const attrs = node.attrs ?? {};

					const posthtmlMatchClass = new PosthtmlMatchClass(node);

					if (!posthtmlMatchClass.refine(targetElementInfo.class)) {
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
				});

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

		console.info(`Prettier finished: ${filePath}`);
	} catch (e) {
		console.error(`Prettier error: ${filePath}`, e);
	}

	/* 出力 */
	const distPath = `${configCommon.static.root}/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;
	await fs.promises.writeFile(distPath, htmlFormatted);
	console.info(`HTML file created: ${distPath}`);
});
