import dayjs from 'dayjs';
import ejs from 'ejs';
import fs from 'fs';
import { globby } from 'globby';
import { JSDOM } from 'jsdom';
import xmlFormatter from 'xml-formatter';
import { NoName as Configure } from '../../configure/type/build.js';
import { W0SJp as ConfigureCommon } from '../../configure/type/common.js';
import PageUrl from '../util/PageUrl.js';

/* 設定ファイル読み込み */
const configCommon = <ConfigureCommon>JSON.parse(await fs.promises.readFile('node/configure/common.json', 'utf8'));
const config = <Configure>JSON.parse(await fs.promises.readFile('node/configure/build.json', 'utf8'));

const filesPath = process.argv[2];
if (filesPath === undefined) {
	throw new Error('Missing parameter');
}

const fileList = await globby(filesPath, {
	ignore: config.sitemap.ignore.map((filePath) => `${config.html.directory}/${filePath}`),
});

const entries = await Promise.all(
	fileList.map(async (filePath) => {
		const publicFilePath = filePath.replaceAll(new RegExp(`^${config.html.directory}`, 'g'), configCommon.static.root);

		/* ファイル読み込み */
		const publicFileData = (await fs.promises.readFile(publicFilePath)).toString();
		const { document } = new JSDOM(publicFileData).window;

		let modified: dayjs.Dayjs | undefined;
		const modifiedElement = document.querySelector<HTMLTimeElement>('time[itemprop="dateModified"]');
		if (modifiedElement !== null) {
			const modifiedDateTime = modifiedElement.dateTime !== '' ? modifiedElement.dateTime : modifiedElement.textContent;
			if (modifiedDateTime === null || !/^([0-9]{4})-[0-9]{2}-[0-9]{2}$/.test(modifiedDateTime)) {
				throw new Error(`\`<time itemprop="dateModified">\` の \`datetime\` 属性値が不正: ${modifiedDateTime}`);
			}

			modified = dayjs(modifiedDateTime);
		}

		const pageUrl = new PageUrl({
			root: configCommon.static.root,
			indexes: configCommon.static.indexes,
			extensions: configCommon.static.extensions,
		});

		const urlPath = pageUrl.getUrl(publicFilePath);

		return {
			path: urlPath,
			updated_at: modified,
		};
	})
);

entries.sort((a, b) => {
	const aDate = a.updated_at?.unix() ?? 0;
	const bDate = b.updated_at?.unix() ?? 0;
	if (aDate !== bDate) {
		return bDate - aDate;
	}

	const aPath = a.path;
	const bPath = b.path;
	if (aPath < bPath) {
		return -1;
	} else if (aPath > bPath) {
		return 1;
	}

	return 0;
});

const sitemap = await ejs.renderFile(`${configCommon.views}/${config.sitemap.template}`, {
	entries: entries,
});

const sitemapFormatted = xmlFormatter(sitemap, {
	/* https://github.com/chrisbottin/xml-formatter#options */
	indentation: '\t',
	collapseContent: true,
	lineSeparator: '\n',
});

/* 出力 */
const sitemapPath = `${configCommon.static.root}/${config.sitemap.path}`;
await fs.promises.writeFile(sitemapPath, sitemapFormatted);
console.info(`Sitemap file created: ${sitemapPath}`);
