import closestHTMLPage from '@w0s/closest-html-page';
import reportJsError from '@w0s/report-js-error';
import reportSameReferrer from '@w0s/report-same-referrer';

/**
 * 403, 404, 410 ページ
 */

/* JS エラーレポート */
reportJsError({
	fetch: {
		endpoint: 'https://report.w0s.jp/report/js',
		param: {
			documentURL: 'documentURL',
			message: 'message',
			filename: 'jsURL',
			lineno: 'lineNumber',
			colno: 'columnNumber',
		},
		contentType: 'application/json',
	},
	validate: {
		filename: {
			allows: [/^https:\/\/w0s\.jp\/assets\/script\/.+\.m?js$/u],
		},
		ua: {
			denys: [/Googlebot\/2.1;/u],
		},
	},
});

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
