import ClosestHTMLPage from '@saekitominaga/closest-html-page';
import PortalAnimation from '@saekitominaga/customelements-portal';
import ReportJsError from '@saekitominaga/report-js-error';
import ReportSameReferrer from '@saekitominaga/report-same-referrer';

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
	}).init();

	/* リファラーレポート */
	new ReportSameReferrer('https://report.w0s.jp/referrer', {
		fetchParam: {
			location: 'location',
			referrer: 'referrer',
		},
		fetchContentType: 'application/json',
		same: ['https://blog.w0s.jp'],
	}).init();

	/* 祖先ページの埋め込み */
	const closestHTMLPage = new ClosestHTMLPage(['text/html', 'application/xhtml+xml'], 6);

	await closestHTMLPage.fetch();
	const url = closestHTMLPage.getUrl();
	const title = closestHTMLPage.getTitle();

	if (url !== null && title !== null) {
		const messageElement = <HTMLElement | null>document.getElementById('parentpage-msg');
		const anchorElement = <HTMLAnchorElement | null>document.getElementById('parentpage-anchor');
		const portalElement = <HTMLPortalElement | null>document.getElementById('parentpage-portal');

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
