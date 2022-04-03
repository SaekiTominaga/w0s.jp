import crypto from 'crypto';
import dayjs from 'dayjs';
import ejs from 'ejs';
import filelist from 'filelist';
import fs from 'fs';
import parse5 from 'parse5';
import prettier from 'prettier';
import xmlFormatter from 'xml-formatter';
import xmlserializer from 'xmlserializer';
import xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';

const FEED_INFOS = [
	{
		html_path: 'public/tokyu/index.html',
		xpath_wrap: '//*[@id="update"]//*[@class="p-top-update-list"]/x:li',
		xpath_date: '*[@class="p-top-update-list__date"]/x:time/@datetime',
		xpath_content: '*[@class="p-top-update-list__info"]/*',
		feed_template: 'views/feed/tokyu.ejs',
		feed_path: 'public/tokyu/feed.atom',
	},
	{
		html_path: 'public/kumeta/index.html',
		xpath_wrap: '//*[@id="update"]//*[@class="p-top-update-list"]/x:li',
		xpath_date: '*[@class="p-top-update-list__date"]/x:time/@datetime',
		xpath_content: '*[@class="p-top-update-list__info"]/*',
		feed_template: 'views/feed/kumeta.ejs',
		feed_path: 'public/kumeta/feed.atom',
	},
	{
		html_path: 'public/madoka/index.html',
		xpath_wrap: '//*[@id="update"]//*[@class="p-top-update-list"]/x:li',
		xpath_date: '*[@class="p-top-update-list__date"]/x:time/@datetime',
		xpath_content: '*[@class="p-top-update-list__info"]/*',
		feed_template: 'views/feed/madoka.ejs',
		feed_path: 'public/madoka/feed.atom',
	},
];

const fileList = new filelist.FileList();
fileList.include(FEED_INFOS.map((value) => value.html_path));
fileList.map(async (htmlPath) => {
	const html = (await fs.promises.readFile(htmlPath)).toString();

	const feedInfo = FEED_INFOS.find((value) => value.html_path === htmlPath);
	if (feedInfo === undefined) {
		return;
	}

	const document = new DOMParser().parseFromString(xmlserializer.serializeToString(parse5.parse(html)), 'text/html');
	const xpathSelect = xpath.useNamespaces({ x: 'http://www.w3.org/1999/xhtml' });

	/* HTML から必要なデータを取得 */
	const entries = [];
	for (const wrapElement of xpathSelect(feedInfo.xpath_wrap, document)) {
		const title = String(xpathSelect(`string(${feedInfo.xpath_content})`, <Node>wrapElement)).trim();
		const updatedTimeElementDatetime = new Date(
			xpathSelect(`string(${feedInfo.xpath_date})`, <Node>wrapElement)
				.toString()
				.trim()
		);
		const links = xpathSelect('.//x:a/@href', <Node>wrapElement).map((value) => String((<Node>value).nodeValue).trim());
		const content = xpathSelect(feedInfo.xpath_content, <Node>wrapElement)
			.toString()
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

	const feedXml = await ejs.renderFile(feedInfo.feed_template, {
		entries: entries,
	});

	const feedXmlFormatted = xmlFormatter(feedXml, {
		/* https://github.com/chrisbottin/xml-formatter#options */
		indentation: '\t',
		collapseContent: true,
		lineSeparator: '\n',
	});

	const feedPath = feedInfo.feed_path;

	await fs.promises.writeFile(feedPath, feedXmlFormatted);
	console.info(`Feed file created: ${feedPath}`);
});
