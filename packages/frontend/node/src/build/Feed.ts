import fs from 'node:fs';
import crypto from 'crypto';
import dayjs from 'dayjs';
import ejs from 'ejs';
import jsdom from 'jsdom';
import prettier from 'prettier';
import xmlFormat from 'xml-formatter';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';
import PrettierUtil from '../util/PrettierUtil.js';

/**
 * フィードファイル生成
 */
export default class Feed extends BuildComponent implements BuildComponentInterface {
	async execute(): Promise<void> {
		const prettierConfig = await PrettierUtil.loadConfig(this.config.prettier.config);
		const prettierOptionsHtml = PrettierUtil.configOverrideAssign(prettierConfig, '*.html');

		this.config.feed.info.forEach(async (feedInfo) => {
			const html = (await fs.promises.readFile(`${this.config.static.root}/${feedInfo.html_path}`)).toString();

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
					console.warn('Date element does not exist');
					return;
				}

				const contentElement = wrapElement.querySelector<HTMLElement>(feedInfo.selector.content);
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

				const contentFormatted = prettier.format(content, prettierOptionsHtml).trim();

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

			const feed = await ejs.renderFile(`${this.config.views}/${feedInfo.feed_template}`, {
				entries: entries,
			});

			/* 整形 */
			const feedFormatted = xmlFormat(feed, {
				/* https://github.com/chrisbottin/xml-formatter#options */
				indentation: '\t',
				collapseContent: true,
				lineSeparator: '\n',
			});

			/* 出力 */
			const feedPath = `${this.config.static.root}/${feedInfo.feed_path}`;
			await fs.promises.writeFile(feedPath, feedFormatted);
			console.info(`Feed file created: ${feedPath}`);
		});
	}
}
