import crypto from 'node:crypto';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { JSDOM } from 'jsdom';
import { load as yamlLoad } from 'js-yaml';
import { format, type Options as PrettierOptions } from 'prettier';
import slash from 'slash';

/**
 * フィードファイル生成
 */

const INFO = [
	{
		srcPath: 'update/tokyu.yaml',
		feedTemplate: 'template/xml/feed_tokyu.ejs',
		feedPath: 'tokyu/feed.atom',
	},
	{
		srcPath: 'update/kumeta.yaml',
		feedTemplate: 'template/xml/feed_kumeta.ejs',
		feedPath: 'kumeta/feed.atom',
	},
	{
		srcPath: 'update/madoka.yaml',
		feedTemplate: 'template/xml/feed_madoka.ejs',
		feedPath: 'madoka/feed.atom',
	},
];

const PRETTIER_OPTIONS_HTML: PrettierOptions = {
	parser: 'html',
	endOfLine: 'lf',
	printWidth: 9999,
	singleQuote: true,
	useTabs: true,
};

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

await Promise.all(
	INFO.map(async (feedInfo) => {
		const fileData = (await fs.promises.readFile(feedInfo.srcPath)).toString();

		/* DOM 化 */
		const parsed = (
			yamlLoad(fileData) as {
				id: string;
				updated: Date;
				content: string;
			}[]
		).map(({ updated, content }) =>
			/* タイムゾーンを変更 */
			({
				updated: new Date(updated.getTime() + updated.getTimezoneOffset() * 60 * 1000),
				content,
			}),
		);

		/* HTML から必要なデータを取得 */
		const entries: {
			title: string;
			unique: string;
			updated: dayjs.Dayjs;
			links: string[];
			content: string;
		}[] = [];

		await Promise.all(
			parsed.map(async ({ updated, content }) => {
				const { document } = new JSDOM(content).window;

				const title = document.body.textContent
					?.trim()
					.replaceAll(/\n+/gv, '\n')
					.split('\n')
					.map((line) => line.trim())
					.join(' / ');
				if (title === undefined || title === '') {
					console.warn('Content element is empty');
					return;
				}

				const contentFormatted = (await format(content, PRETTIER_OPTIONS_HTML)).trim();

				const internalLinkURLs = [...document.body.querySelectorAll('a[href^="/"]')].map(
					(anchorElement) => (anchorElement as unknown as HTMLAnchorElement).href,
				);

				const md5 = crypto.createHash('md5');
				md5.update(`${String(updated.getTime() / 1000)}${internalLinkURLs.join('')}`);
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
			const aDate = a.updated.unix();
			const bDate = b.updated.unix();
			if (aDate !== bDate) {
				return bDate - aDate;
			}

			return 0;
		});

		const feed = await ejs.renderFile(feedInfo.feedTemplate, {
			entries: entries,
		});

		/* 出力 */
		const feedPath = `${directory}/${feedInfo.feedPath}`;
		await fs.promises.writeFile(feedPath, feed);
		console.info(`Feed file created: ${feedPath}`);
	}),
);
