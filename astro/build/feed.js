import crypto from 'node:crypto';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { JSDOM } from 'jsdom';
import prettier from 'prettier';
import slash from 'slash';
import xmlFormat from 'xml-formatter';

/**
 * フィードファイル生成
 */

const INFO = [
	{
		html_path: 'tokyu/index.html',
		selector: {
			wrap: '#update .p-top-update-list > li',
			date: '.p-top-update-list__date > time',
			content: '.p-top-update-list__info',
		},
		feed_template: 'template/xml/feed_tokyu.ejs',
		feed_path: 'tokyu/feed.atom',
	},
	{
		html_path: 'kumeta/index.html',
		selector: {
			wrap: '#update .p-top-update-list > li',
			date: '.p-top-update-list__date > time',
			content: '.p-top-update-list__info',
		},
		feed_template: 'template/xml/feed_kumeta.ejs',
		feed_path: 'kumeta/feed.atom',
	},
	{
		html_path: 'madoka/index.html',
		selector: {
			wrap: '#update .p-top-update-list > li',
			date: '.p-top-update-list__date > time',
			content: '.p-top-update-list__info',
		},
		feed_template: 'template/xml/feed_madoka.ejs',
		feed_path: 'madoka/feed.atom',
	},
];

const PRETTIER_OPTIONS_HTML = {
	parser: 'html',
	endOfLine: 'lf',
	printWidth: 9999,
	singleQuote: true,
	useTabs: true,
};

const XML_FORMAT_OPTIONS = {
	indentation: '\t',
	collapseContent: true,
	lineSeparator: '\n',
}; // https://github.com/chrisbottin/xml-formatter#options

/* 引数処理 */
const argsParsedValues = parseArgs({
	options: {
		directory: {
			type: 'string',
			short: 'd',
		},
	},
}).values;

if (argsParsedValues.directory === undefined) {
	throw new Error('Argument `directory` not specified');
}
const directory = slash(argsParsedValues.directory);

INFO.forEach(async (feedInfo) => {
	const html = (await fs.promises.readFile(`${directory}/${feedInfo.html_path}`)).toString();

	/* DOM 化 */
	const { document } = new JSDOM(html).window;

	/* HTML から必要なデータを取得 */
	const entries = [];

	await Promise.all(
		[...document.querySelectorAll(feedInfo.selector.wrap)].map(async (wrapElement) => {
			const dateElement = wrapElement.querySelector(feedInfo.selector.date);
			if (dateElement === null) {
				console.warn('Date element does not exist');
				return;
			}

			const contentElement = wrapElement.querySelector(feedInfo.selector.content);
			if (contentElement === null) {
				console.warn('Content element does not exist');
				return;
			}

			const title = contentElement.textContent
				?.split('\n')
				.map((line) => line.trim())
				.join('');
			if (title === undefined || title === '') {
				console.warn('Content element is empty');
				return;
			}

			const updated = new Date(`${dateElement.dateTime}T00:00`);
			const content = contentElement.innerHTML;

			const contentFormatted = (await prettier.format(content, PRETTIER_OPTIONS_HTML)).trim();

			const internalLinkURLs = [...contentElement.querySelectorAll('a[href^="/"]')].map((anchorElement) => anchorElement.href);

			const md5 = crypto.createHash('md5');
			md5.update(`${updated.getTime() / 1000}${internalLinkURLs.join('')}`);
			const unique = md5.digest('hex'); // entry 毎のユニーク文字列（更新日と URL の組み合わせならまあ被らないだろうという目論見）

			entries.push({
				title: title,
				unique: unique,
				updated: dayjs(updated),
				links: internalLinkURLs,
				content: contentFormatted,
			});
		}),
	);

	entries.sort((a, b) => {
		const aDate = a.updated?.unix() ?? 0;
		const bDate = b.updated?.unix() ?? 0;
		if (aDate !== bDate) {
			return bDate - aDate;
		}

		return 0;
	});

	const feed = await ejs.renderFile(feedInfo.feed_template, {
		entries: entries,
	});

	/* 整形 */
	const feedFormatted = xmlFormat(feed, XML_FORMAT_OPTIONS);

	/* 出力 */
	const feedPath = `${directory}/${feedInfo.feed_path}`;
	await fs.promises.writeFile(feedPath, feedFormatted);
	console.info(`Feed file created: ${feedPath}`);
});
