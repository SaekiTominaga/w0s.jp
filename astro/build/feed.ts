import crypto from 'node:crypto';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { Parser, HtmlRenderer } from 'commonmark';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { JSDOM } from 'jsdom';
import { load as yamlLoad } from 'js-yaml';
import slash from 'slash';

/**
 * フィードファイル生成
 */

const INFO = [
	{
		srcPath: 'update/tokyu.yaml',
		feedTemplate: 'template/xml/feed_tokyu.ejs',
		feedPath: 'tokyu/feed.atom',
	},
	{
		srcPath: 'update/kumeta.yaml',
		feedTemplate: 'template/xml/feed_kumeta.ejs',
		feedPath: 'kumeta/feed.atom',
	},
	{
		srcPath: 'update/madoka.yaml',
		feedTemplate: 'template/xml/feed_madoka.ejs',
		feedPath: 'madoka/feed.atom',
	},
];

export const markdown = (mdStr: string) => {
	const parsed = new Parser().parse(mdStr);
	const html = new HtmlRenderer().render(parsed);

	const contentWalker = parsed.walker();

	let event = contentWalker.next();
	const linkDestinations = new Set<string>();
	// eslint-disable-next-line functional/no-loop-statements
	while (event !== null) {
		if (event.entering && event.node.type === 'link' && event.node.destination !== null) {
			linkDestinations.add(event.node.destination);
		}

		event = contentWalker.next();
	}

	return {
		html: html.trim(),
		linkDestinations: Array.from(linkDestinations),
	};
};

export const yaml = (yamlStr: string) =>
	(
		yamlLoad(yamlStr) as {
			id: string;
			updated: Date;
			content: string;
		}[]
	)
		.map(({ updated: updatedUTC, content }) => {
			const { html: contentHtml, linkDestinations } = markdown(content);

			const { document } = new JSDOM(contentHtml).window;
			const title = document.body.textContent?.trim().split('\n').join(' / ');
			if (title === undefined || title === '') {
				console.warn('Content element is empty');
				return undefined;
			}

			const updated = updatedUTC.getTime() + updatedUTC.getTimezoneOffset() * 60 * 1000;

			const md5 = crypto.createHash('md5');
			md5.update(`${String(updated / 1000)}${linkDestinations.join('')}`);
			const unique = md5.digest('hex'); // entry 毎のユニーク文字列（更新日と URL の組み合わせならまあ被らないだろうという目論見）

			return {
				/* タイトル */
				title: title,
				/* ID に使うユニークな値 */
				unique: unique,
				/* タイムゾーンを変更 */
				updated: dayjs(updated),
				/* 本文中にあるリンクの宛先 */
				links: linkDestinations,
				/* Markdown → HTML */
				content: contentHtml,
			};
		})
		.filter((entry) => entry !== undefined);

if (import.meta.url === slash(`file:///${process.argv.at(1) ?? ''}`)) {
	/* 引数処理 */
	const argsParsedValues = parseArgs({
		options: {
			directory: {
				type: 'string',
				short: 'd',
			},
		},
	}).values;

	if (argsParsedValues.directory === undefined) {
		throw new Error('Argument `directory` not specified');
	}
	const directory = slash(argsParsedValues.directory);

	await Promise.all(
		INFO.map(async (feedInfo) => {
			const entries = yaml((await fs.promises.readFile(feedInfo.srcPath)).toString());

			const feed = await ejs.renderFile(feedInfo.feedTemplate, {
				entries: entries,
			});

			/* 出力 */
			const feedPath = `${directory}/${feedInfo.feedPath}`;
			await fs.promises.writeFile(feedPath, feed);
			console.info(`Feed file created: ${feedPath}`);
		}),
	);
}
