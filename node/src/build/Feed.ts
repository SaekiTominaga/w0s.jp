import fs from 'node:fs';
import crypto from 'crypto';
import dayjs from 'dayjs';
import ejs from 'ejs';
import jsdom from 'jsdom';
import prettier from 'prettier';
import xmlFormatter from 'xml-formatter';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';

/**
 * フィードファイル生成
 */
export default class Feed extends BuildComponent implements BuildComponentInterface {
	async execute(): Promise<void> {
		this.configBuild.feed.info.forEach(async (feedInfo) => {
			const html = (await fs.promises.readFile(`${this.configCommon.static.root}/${feedInfo.html_path}`)).toString();

			/* DOM 化 */
			const { document } = new jsdom.JSDOM(html).window;

			/* HTML から必要なデータを取得 */
			const entries: {
				title: string;
				unique: string;
				last_updated: dayjs.Dayjs;
				links: string[];
				content: string;
			}[] = [];

			document.querySelectorAll(feedInfo.selector.wrap).forEach((wrapElement) => {
				const dateElement = wrapElement.querySelector<HTMLTimeElement>(feedInfo.selector.date);
				if (dateElement === null) {
					this.logger.warn('Date element does not exist');
					return;
				}

				const contentElement = wrapElement.querySelector<HTMLElement>(feedInfo.selector.content);
				if (contentElement === null) {
					this.logger.warn('Content element does not exist');
					return;
				}

				const title = contentElement.textContent
					?.split('\n')
					.map((line) => line.trim())
					.join('');
				if (title === undefined || title === '') {
					this.logger.warn('Content element is empty');
					return;
				}

				const updated = new Date(`${dateElement.dateTime}T00:00`);
				const content = contentElement.innerHTML;

				const contentFormatted = prettier
					.format(content, {
						/* https://prettier.io/docs/en/options.html */
						printWidth: 9999,
						parser: 'html',
					})
					.trim();

				const internalLinkURLs = [...contentElement.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')].map((anchorElement) => anchorElement.href);

				const md5 = crypto.createHash('md5');
				md5.update(`${updated.getTime() / 1000}${internalLinkURLs.join('')}`);
				const unique = md5.digest('hex'); // entry 毎のユニーク文字列（更新日と URL の組み合わせならまあ被らないだろうという目論見）

				entries.push({
					title: title,
					unique: unique,
					last_updated: dayjs(updated),
					links: internalLinkURLs,
					content: contentFormatted,
				});
			});

			const feed = await ejs.renderFile(`${this.configCommon.views}/${feedInfo.feed_template}`, {
				entries: entries,
			});

			const feedFormatted = xmlFormatter(feed, {
				/* https://github.com/chrisbottin/xml-formatter#options */
				indentation: '\t',
				collapseContent: true,
				lineSeparator: '\n',
			});

			/* 出力 */
			const feedPath = `${this.configCommon.static.root}/${feedInfo.feed_path}`;
			await fs.promises.writeFile(feedPath, feedFormatted);
			this.logger.info(`Feed file created: ${feedPath}`);
		});
	}
}
