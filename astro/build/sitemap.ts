import fs from 'node:fs';
import { parseArgs } from 'node:util';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { JSDOM } from 'jsdom';
import { getPageUrl } from './util.ts';

/**
 * サイトマップファイル生成
 */

/* 引数処理 */
const argsParsedValues = parseArgs({
	options: {
		directory: {
			type: 'string',
			short: 'd',
		},
		ignore: {
			type: 'string',
			multiple: true,
		},
		template: {
			type: 'string',
			short: 't',
		},
		output: {
			type: 'string',
			short: 'o',
		},
	},
}).values;

if (argsParsedValues.directory === undefined) {
	throw new Error('Argument `directory` not specified');
}
if (argsParsedValues.template === undefined) {
	throw new Error('Argument `template` not specified');
}
const { directory, ignore: ignores, template, output } = argsParsedValues;

const fileList = await Array.fromAsync(
	fs.promises.glob(`${directory}/**/*.html`, {
		exclude: ignores?.map((filePath) => `${directory}/${filePath}`),
	}),
);

const entries = await Promise.all(
	fileList.map(async (filePath) => {
		const html = (await fs.promises.readFile(filePath)).toString();

		/* DOM 化 */
		const { document } = new JSDOM(html).window;

		const modifiedAt = document.querySelector<HTMLTimeElement>('.l-content__header .updated > time')?.dateTime;

		return {
			pagePathAbsoluteUrl: getPageUrl(filePath.substring(directory.length)), // U+002F (/) から始まるパス絶対 URL
			modified_at: modifiedAt !== undefined ? dayjs(modifiedAt) : undefined,
		};
	}),
);

entries.sort((a, b) => {
	const aDate = a.modified_at?.unix() ?? 0;
	const bDate = b.modified_at?.unix() ?? 0;
	if (aDate !== bDate) {
		return bDate - aDate;
	}

	const aPath = a.pagePathAbsoluteUrl;
	const bPath = b.pagePathAbsoluteUrl;
	if (aPath < bPath) {
		return -1;
	} else if (aPath > bPath) {
		return 1;
	}

	return 0;
});

const sitemap = await ejs.renderFile(template, {
	entries: entries,
});

/* 出力 */
const sitemapPath = `${directory}/${output ?? 'sitemap.xml'}`;
await fs.promises.writeFile(sitemapPath, sitemap);
console.info(`Sitemap created: ${sitemapPath}`);
