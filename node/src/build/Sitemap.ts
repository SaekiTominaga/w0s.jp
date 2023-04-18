import dayjs from 'dayjs';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import slash from 'slash';
import { globby } from 'globby';
import xmlFormatter from 'xml-formatter';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';
import HtmlStructuredData from '../util/HtmlStructuredData.js';
import PageUrl from '../util/PageUrl.js';

/**
 * サイトマップファイル生成
 */
export default class Sitemap extends BuildComponent implements BuildComponentInterface {
	async execute(args: string[]): Promise<void> {
		const filesPathOs = args.at(0);
		if (filesPathOs === undefined) {
			throw new Error('Missing parameter');
		}
		const filesPath = slash(filesPathOs);

		const fileList = await globby(filesPath, {
			ignore: this.configBuild.sitemap.ignore.map((filePath) => `${this.configBuild.html.directory}/${filePath}`),
		});

		const entries = await Promise.all(
			fileList.map(async (filePath): Promise<{ pagePathAbsoluteUrl: string; modified_at: dayjs.Dayjs | undefined }> => {
				const structuredData = await HtmlStructuredData.getForHtml(filePath, this.configBuild.html.structured_selector); // 構造データ

				const pageUrl = new PageUrl({
					root: this.configCommon.static.root,
					indexes: this.configCommon.static.indexes,
					extensions: this.configCommon.static.extensions,
				});

				const publicFileParse = path.parse(filePath.replace(new RegExp(`^${this.configBuild.html.directory}`), this.configCommon.static.root));
				const publicFilePath = `${publicFileParse.dir}/${publicFileParse.name}.html`;

				this.logger.debug(publicFilePath);

				return {
					pagePathAbsoluteUrl: pageUrl.getUrl(publicFilePath), // U+002F (/) から始まるパス絶対 URL
					modified_at: structuredData.dateModified,
				};
			})
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

		const sitemap = await ejs.renderFile(`${this.configCommon.views}/${this.configBuild.sitemap.template}`, {
			entries: entries,
		});

		const sitemapFormatted = xmlFormatter(sitemap, {
			/* https://github.com/chrisbottin/xml-formatter#options */
			indentation: '\t',
			collapseContent: true,
			lineSeparator: '\n',
		});

		/* 出力 */
		const sitemapPath = `${this.configCommon.static.root}/${this.configBuild.sitemap.path}`;
		await fs.promises.writeFile(sitemapPath, sitemapFormatted);
		this.logger.info(`Sitemap file created: ${sitemapPath}`);
	}
}
