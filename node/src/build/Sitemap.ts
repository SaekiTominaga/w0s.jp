import dayjs from 'dayjs';
import ejs from 'ejs';
import fs from 'fs';
import { globby } from 'globby';
import { JSDOM } from 'jsdom';
import xmlFormatter from 'xml-formatter';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';
import PageUrl from '../util/PageUrl.js';

/**
 * サイトマップファイル生成
 */
export default class Sitemap extends BuildComponent implements BuildComponentInterface {
	async execute(args: string[]): Promise<void> {
		const filesPath = args.at(0);
		if (filesPath === undefined) {
			throw new Error('Missing parameter');
		}

		const fileList = await globby(filesPath, {
			ignore: this.configBuild.sitemap.ignore.map((filePath) => `${this.configBuild.html.directory}/${filePath}`),
		});

		const entries = await Promise.all(
			fileList.map(async (filePath) => {
				/* ファイル読み込み */
				const fileData = (await fs.promises.readFile(filePath)).toString();
				const { document } = new JSDOM(fileData).window;

				let modified: dayjs.Dayjs | undefined;
				const modifiedElement = document.querySelector<HTMLMetaElement>('meta[itemprop="dateModified"]');
				if (modifiedElement !== null) {
					const modifiedDateTime = modifiedElement.content;
					if (!/^([0-9]{4})-[0-9]{2}-[0-9]{2}$/.test(modifiedDateTime)) {
						throw new Error(`\`<time itemprop="dateModified">\` の \`datetime\` 属性値が不正: ${modifiedDateTime}`);
					}

					modified = dayjs(modifiedDateTime);
				}

				const pageUrl = new PageUrl({
					root: this.configCommon.static.root,
					indexes: this.configCommon.static.indexes,
					extensions: this.configCommon.static.extensions,
				});

				const publicFilePath = filePath.replaceAll(new RegExp(`^${this.configBuild.html.directory}`, 'g'), this.configCommon.static.root);
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
