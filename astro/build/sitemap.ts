import fs from 'node:fs';
import { parseArgs } from 'node:util';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { getPageUrl } from './util.ts';

/**
 * サイトマップファイル生成
 */

/* 引数処理 */
const argsParsedValues = parseArgs({
	options: {
		templatePath: {
			type: 'string',
			short: 't',
		},
		outDir: {
			type: 'string',
			short: 'o',
		},
		ignore: {
			type: 'string',
			multiple: true,
		},
	},
}).values;

if (argsParsedValues.templatePath === undefined) {
	throw new Error('Argument `templateDir` not specified');
}
if (argsParsedValues.outDir === undefined) {
	throw new Error('Argument `outDir` not specified');
}
const { templatePath, outDir, ignore: ignores } = argsParsedValues;

const fileList = await Array.fromAsync(
	fs.promises.glob(`${outDir}/**/*.html`, {
		exclude: ignores?.map((filePath) => `${outDir}/${filePath}`),
	}),
);

const entries = await Promise.all(
	fileList.map(async (filePath) => {
		const $ = cheerio.load(await fs.promises.readFile(filePath));

		const modifiedAt = $('.l-content__header .updated > time').attr('datetime');

		return {
			pagePath: getPageUrl(filePath.substring(outDir.length)), // U+002F (/) から始まるパス絶対 URL
			modifiedAt: modifiedAt !== undefined ? dayjs(modifiedAt) : undefined,
		};
	}),
);

entries.sort((a, b) => {
	const aDate = a.modifiedAt?.unix() ?? 0;
	const bDate = b.modifiedAt?.unix() ?? 0;
	if (aDate !== bDate) {
		return bDate - aDate;
	}

	const aPath = a.pagePath;
	const bPath = b.pagePath;
	if (aPath < bPath) {
		return -1;
	} else if (aPath > bPath) {
		return 1;
	}

	return 0;
});

const sitemap = await ejs.renderFile(templatePath, {
	entries: entries,
});

/* 出力 */
const sitemapPath = `${outDir}/sitemap.xml`;
await fs.promises.writeFile(sitemapPath, sitemap);
console.info(`Sitemap file created: ${sitemapPath}`);
