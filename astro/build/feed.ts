import crypto from 'node:crypto';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { Parser, HtmlRenderer } from 'commonmark';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { load as yamlLoad } from 'js-yaml';
import slash from 'slash';

/**
 * フィードファイル生成
 */

const INFO = [
	{
		srcPath: 'update/tokyu.yaml',
		feedTemplate: 'feed_tokyu.ejs',
		feedPath: 'tokyu/feed.atom',
	},
	{
		srcPath: 'update/kumeta.yaml',
		feedTemplate: 'feed_kumeta.ejs',
		feedPath: 'kumeta/feed.atom',
	},
	{
		srcPath: 'update/madoka.yaml',
		feedTemplate: 'feed_madoka.ejs',
		feedPath: 'madoka/feed.atom',
	},
];

export const markdownRendar = (mdStr: string) => {
	const parsed = new Parser().parse(mdStr);
	const html = new HtmlRenderer().render(parsed);

	const walker = parsed.walker();

	let event = walker.next();

	const title: string[] = [];
	const linkDestinations = new Set<string>();
	// eslint-disable-next-line functional/no-loop-statements
	while (event !== null) {
		if (event.entering) {
			const { node } = event;
			const { type: nodeType } = node;

			if (nodeType === 'paragraph') {
				title.push('');
			} else if ((nodeType === 'text' || nodeType === 'code') && node.literal !== null) {
				title.splice(-1, 1, `${title.at(-1) ?? ''}${node.literal}`);
			}

			if (nodeType === 'link' && node.destination !== null) {
				linkDestinations.add(node.destination);
			}
		}

		event = walker.next();
	}

	return {
		html: html.trim(),
		title: title.join(' / '),
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
	).map(({ updated: updatedUTC, content }) => {
		const { html: contentHtml, title, linkDestinations } = markdownRendar(content);

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
	});

if (import.meta.url === slash(`file:///${process.argv.at(1) ?? ''}`)) {
	/* 引数処理 */
	const argsParsedValues = parseArgs({
		options: {
			outDir: {
				type: 'string',
				short: 'o',
			},
			templateDir: {
				type: 'string',
				short: 't',
			},
		},
	}).values;

	if (argsParsedValues.templateDir === undefined) {
		throw new Error('Argument `templateDir` not specified');
	}
	if (argsParsedValues.outDir === undefined) {
		throw new Error('Argument `outDir` not specified');
	}
	const { templateDir, outDir } = argsParsedValues;

	await Promise.all(
		INFO.map(async (feedInfo) => {
			const entries = yaml((await fs.promises.readFile(feedInfo.srcPath)).toString());

			const feed = await ejs.renderFile(`${templateDir}/${feedInfo.feedTemplate}`, {
				entries: entries,
			});

			/* 出力 */
			const feedPath = `${outDir}/${feedInfo.feedPath}`;
			await fs.promises.writeFile(feedPath, feed);
			console.info(`Feed file created: ${feedPath}`);
		}),
	);
}
