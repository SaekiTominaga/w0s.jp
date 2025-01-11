import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { glob } from 'glob';
import { JSDOM } from 'jsdom';
import slash from 'slash';
import xmlFormat from 'xml-formatter';

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
const directory = slash(argsParsedValues.directory);
const ignores = argsParsedValues.ignore;
const template = slash(argsParsedValues.template);
const outputPath = slash(argsParsedValues.output ?? 'sitemap.xml');

const filesPath = `${directory}/**/*.html`;

const fileList = await glob(filesPath, {
	ignore: ignores?.map((filePath) => `${directory}/${filePath}`) ?? [],
});

/**
 * 実ファイルパスを元にレスポンス URL のパスを取得する
 *
 * @param filePath - 実ファイルパス
 *
 * @returns  レスポンス URL のパス（ルート相対パス）
 */
const getPageUrl = (filePath: string): string => {
	const parsed = path.parse(slash(filePath));
	const dir = parsed.dir === '/' ? '' : parsed.dir;

	if (['index.html'].includes(parsed.base)) {
		/* インデックスファイルはファイル名を省略する */
		return `${dir}/`;
	}

	if (['.html'].includes(parsed.ext)) {
		/* 指定された拡張子を除去する */
		return `${dir}/${parsed.name}`;
	}

	return `${dir}/${parsed.name}${parsed.ext}`;
};

const entries = await Promise.all(
	fileList.map(async (filePath) => {
		const html = (await fs.promises.readFile(filePath)).toString();

		/* DOM 化 */
		const { document } = new JSDOM(html).window;

		const modifiedAt = document.querySelector<HTMLTimeElement>('.p-title time')?.dateTime;

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

const sitemapFormatted = xmlFormat(sitemap, {
	/* https://github.com/chrisbottin/xml-formatter#options */
	indentation: '\t',
	collapseContent: true,
	lineSeparator: '\n',
});

/* 出力 */
const sitemapPath = `${directory}/${outputPath}`;
await fs.promises.writeFile(sitemapPath, sitemapFormatted);
console.info(`Sitemap created: ${sitemapPath}`);
