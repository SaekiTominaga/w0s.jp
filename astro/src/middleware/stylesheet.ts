import type { HTMLElement } from 'node-html-parser';

/**
 * `<link rel="stylesheet">` の挿入位置を最初の要素がある位置を基準にしてまとめる
 *
 * @param root - Root element
 */
export const adjustLinkStylesheetPosition = (root: HTMLElement) => {
	const linkStylesheets = root.querySelectorAll('head > link[rel~="stylesheet"]');

	const rest = linkStylesheets.slice(1); // 2番目以降のスタイルシート要素

	linkStylesheets.slice(1).forEach((link) => {
		link.remove();
	});

	let current = linkStylesheets.at(0);
	rest.forEach((link) => {
		current?.after(link);
		current = link;
	});
};
