import ClosestHTMLPage from '@w0s/closest-html-page';
import reportJsError from '@w0s/report-js-error';
import reportSameReferrer from '@w0s/report-same-referrer';

/**
 * 403, 404, 410 ページ
 */

/* JS エラーレポート */
reportJsError('https://report.w0s.jp/report/report/js', {
	fetchParam: {
		documentURL: 'documentURL',
		message: 'message',
		filename: 'jsURL',
		lineno: 'lineNumber',
		colno: 'columnNumber',
	},
	fetchContentType: 'application/json',
	allowFilenames: [/^https:\/\/w0s\.jp\/assets\/script\/.+\.m?js$/u],
	denyUAs: [/Googlebot\/2.1;/u],
});

/* リファラーレポート */
await reportSameReferrer('https://report.w0s.jp/report/referrer', {
	fetchParam: {
		documentURL: 'documentURL',
		referrer: 'referrer',
	},
	fetchContentType: 'application/json',
	same: ['https://blog.w0s.jp'],
});

/* 祖先ページの埋め込み */
const closestHTMLPage = new ClosestHTMLPage({
	maxFetchCount: 6,
	fetchOptions: { redirect: 'manual' },
	mimeTypes: ['text/html', 'application/xhtml+xml'],
});

await closestHTMLPage.fetch();
const { url, title } = closestHTMLPage;

if (url !== null && title !== null) {
	const messageElement = document.getElementById('parentpage-msg');
	const anchorElement = document.getElementById('parentpage-anchor') as HTMLAnchorElement | null;

	if (messageElement !== null && anchorElement !== null) {
		messageElement.hidden = false;

		anchorElement.href = url;
		anchorElement.textContent = title;
	}
}
