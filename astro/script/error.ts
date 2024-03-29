import ClosestHTMLPage from '@w0s/closest-html-page';
import PortalAnimation from '@w0s/portal-animation';
import ReportJsError from '@w0s/report-js-error';
import ReportSameReferrer from '@w0s/report-same-referrer';

/**
 * 403, 404, 410 ページ
 */
const { portalHost } = window;
if (portalHost === null || portalHost === undefined /* <potal> 未対応ブラウザは undefined になる */) {
	/* JS エラーレポート */
	new ReportJsError('https://report.w0s.jp/js', {
		fetchParam: {
			location: 'location',
			message: 'message',
			filename: 'filename',
			lineno: 'lineno',
			colno: 'colno',
		},
		fetchContentType: 'application/json',
		allowFilenames: [/^https:\/\/w0s\.jp\/assets\/script\/.+\.m?js$/],
		denyUAs: [/Googlebot\/2.1;/],
	});

	/* リファラーレポート */
	await new ReportSameReferrer('https://report.w0s.jp/referrer', {
		fetchParam: {
			location: 'location',
			referrer: 'referrer',
		},
		fetchContentType: 'application/json',
		same: ['https://blog.w0s.jp'],
	}).report();

	/* 祖先ページの埋め込み */
	const closestHTMLPage = new ClosestHTMLPage({
		maxFetchCount: 6,
		fetchOptions: { redirect: 'manual' },
		mimeTypes: ['text/html', 'application/xhtml+xml'],
	});

	await closestHTMLPage.fetch();
	const url = closestHTMLPage.getUrl();
	const title = closestHTMLPage.getTitle();

	if (url !== null && title !== null) {
		const messageElement = document.getElementById('parentpage-msg');
		const anchorElement = document.getElementById('parentpage-anchor') as HTMLAnchorElement | null;
		const portalElement = document.getElementById('parentpage-portal') as HTMLPortalElement | null;

		if (messageElement !== null && anchorElement !== null) {
			messageElement.hidden = false;

			anchorElement.href = url;
			anchorElement.textContent = title;

			if (portalElement !== null && window.HTMLPortalElement !== undefined /* <potal> 要素をサポートしているか */ && window.customElements !== undefined) {
				portalElement.src = url;
				portalElement.title = title;
				portalElement.hidden = false;

				customElements.define('w0s-portal', PortalAnimation);
			}
		}
	}
}
