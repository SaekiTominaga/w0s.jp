import crypto from 'crypto';
import dayjs from 'dayjs';
import ejs from 'ejs';
import fs from 'fs';
import jsdom from 'jsdom';
import prettier from 'prettier';
import xmlFormatter from 'xml-formatter';
import xpath from 'xpath';
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
			const xpathSelect = xpath.useNamespaces({ x: 'http://www.w3.org/1999/xhtml' });

			/* HTML から必要なデータを取得 */
			const entries: {
				title: string;
				unique: string;
				last_updated: dayjs.Dayjs;
				links: string[];
				content: string;
			}[] = [];
			for (const wrapElement of xpathSelect(feedInfo.xpath.wrap, document)) {
				const title = String(xpathSelect(`string(${feedInfo.xpath.content})`, <Node>wrapElement)).trim();
				const updatedTimeElementDatetime = new Date(
					xpathSelect(`string(${feedInfo.xpath.date})`, <Node>wrapElement)
						.toString()
						.trim()
				);

				// eslint-disable-next-line no-loop-func
				const links = xpathSelect('.//x:a/@href', <Node>wrapElement).map((value) => String((<Node>value).nodeValue).trim());
				const content = xpathSelect(feedInfo.xpath.content, <Node>wrapElement)
					.join('')
					.replace(' xmlns="http://www.w3.org/1999/xhtml"', '');

				const updated = new Date(updatedTimeElementDatetime.getTime() + updatedTimeElementDatetime.getTimezoneOffset() * 60000);

				const contentFormatted = prettier
					.format(content, {
						/* https://prettier.io/docs/en/options.html */
						printWidth: 9999,
						parser: 'html',
					})
					.trim();

				const md5 = crypto.createHash('md5');
				md5.update(`${updated.getTime() / 1000}${links.join('')}`);
				const unique = md5.digest('hex'); // entry 毎のユニーク文字列（更新日と URL の組み合わせならまあ被らないだろうという目論見）

				entries.push({
					title: title,
					unique: unique,
					last_updated: dayjs(updated),
					links: links,
					content: contentFormatted,
				});
			}

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
