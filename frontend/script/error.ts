import closestHTMLPage from '@w0s/closest-html-page';
import reportSameReferrer from '@w0s/report-same-referrer';
import reportJsError from './util/reportJsError.ts';

/**
 * 403, 404, 410 ページ
 */

/* JS エラーレポート */
reportJsError();

/* リファラーレポート */
await reportSameReferrer({
	fetch: {
		endpoint: 'https://report.w0s.jp/report/referrer',
		param: {
			documentURL: 'documentURL',
			referrer: 'referrer',
		},
		contentType: 'application/json',
	},
	validate: {
		referrer: {
			sames: ['https://blog.w0s.jp'],
		},
	},
});

/* 祖先ページの埋め込み */
const { closestHTMLPageData } = await closestHTMLPage(undefined, {
	maxFetchCount: 6,
	fetchOptions: { redirect: 'manual' },
	mimeTypes: ['text/html', 'application/xhtml+xml'],
});

if (closestHTMLPageData !== undefined) {
	const { url, title } = closestHTMLPageData;

	const messageElement = document.getElementById('parentpage-msg');
	const anchorElement = document.getElementById('parentpage-anchor') as HTMLAnchorElement | null;

	if (messageElement !== null && anchorElement !== null) {
		messageElement.hidden = false;

		anchorElement.href = url;
		anchorElement.textContent = title ?? url;
	}
}
