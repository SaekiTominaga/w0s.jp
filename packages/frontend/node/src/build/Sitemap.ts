import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { globby } from 'globby';
import xmlFormat from 'xml-formatter';
import HtmlStructuredData from '@w0s.jp/util/dist/HtmlStructuredData.js';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';
import PageUrl from '../util/PageUrl.js';

/**
 * サイトマップファイル生成
 */
export default class Sitemap extends BuildComponent implements BuildComponentInterface {
	async execute(): Promise<void> {
		const fileList = await globby(`${this.config.html.directory}/**/*.html`, {
			ignore: this.config.sitemap.ignore.map((filePath) => `${this.config.html.directory}/${filePath}`),
		});

		const entries = await Promise.all(
			fileList.map(async (filePath): Promise<{ pagePathAbsoluteUrl: string; modified_at: dayjs.Dayjs | undefined }> => {
				const structuredData = await HtmlStructuredData.getForJson(filePath); // 構造データ

				const pageUrl = new PageUrl({
					root: this.config.static.root,
					indexes: this.config.static.indexes,
					extensions: this.config.static.extensions,
				});

				const publicFileParse = path.parse(filePath.replace(new RegExp(`^${this.config.html.directory}`), this.config.static.root));
				const publicFilePath = `${publicFileParse.dir}/${publicFileParse.name}.html`;

				return {
					pagePathAbsoluteUrl: pageUrl.getUrl(publicFilePath), // U+002F (/) から始まるパス絶対 URL
					modified_at: structuredData.dateModified,
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

		const sitemap = await ejs.renderFile(`${this.config.views}/${this.config.sitemap.template}`, {
			entries: entries,
		});

		const sitemapFormatted = xmlFormat(sitemap, {
			/* https://github.com/chrisbottin/xml-formatter#options */
			indentation: '\t',
			collapseContent: true,
			lineSeparator: '\n',
		});

		/* 出力 */
		const sitemapPath = `${this.config.static.root}/${this.config.sitemap.path}`;
		await fs.promises.writeFile(sitemapPath, sitemapFormatted);
		console.info(`Sitemap file created: ${sitemapPath}`);
	}
}
