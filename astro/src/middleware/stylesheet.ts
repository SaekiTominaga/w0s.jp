import type { CheerioAPI } from 'cheerio';

/**
 * `<link rel="stylesheet">` の挿入位置を最初の要素がある位置を基準にしてまとめる
 *
 * @param $ - CheerioAPI
 */
export const adjustLinkStylesheetPosition = ($: CheerioAPI) => {
	const $linkStylesheets = $('head > link[rel~="stylesheet"]');

	const rest = $linkStylesheets.slice(1).toArray(); // 2番目以降のスタイルシート要素
	$linkStylesheets.slice(1).remove();

	let $current = $linkStylesheets.first();
	rest.forEach((link) => {
		const $link = $(link);
		$current.after($link);
		$current = $link;
	});
};
