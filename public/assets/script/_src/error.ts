import ClosestHTMLPage from '@saekitominaga/closest-html-page';
import Portal from '@saekitominaga/customelements-portal';
import ReportJsError from '@saekitominaga/report-js-error';
import ReportSameReferrer from '@saekitominaga/report-same-referrer';

/**
 * 403, 404, 410 ページ
 */
const reportJsError = new ReportJsError('https://report.w0s.jp/js', {
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
reportJsError.init();

const portalHost = window.portalHost;
if (portalHost === null || portalHost === undefined /* 未対応ブラウザ対策 */) {
	const reportSameReferrer = new ReportSameReferrer('https://report.w0s.jp/referrer', {
		fetchParam: {
			location: 'location',
			referrer: 'referrer',
		},
		fetchContentType: 'application/json',
	});
	reportSameReferrer.init();

	const supportPortalElement = window.HTMLPortalElement !== undefined; // <potal> 要素をサポートしているか

	if (supportPortalElement && window.customElements !== undefined) {
		customElements.define('w0s-portal', Portal);
	}

	const closestHTMLPage = new ClosestHTMLPage(['text/html', 'application/xhtml+xml'], 6);

	window.addEventListener('load', async () => {
		const parentpageMessageElement = <HTMLElement>document.getElementById('parentpage-msg');
		const parentpageAnchorElement = <HTMLAnchorElement>document.getElementById('parentpage-anchor');
		const parentpagePortalElement = <HTMLPortalElement>document.getElementById('parentpage-portal');

		await closestHTMLPage.fetch();
		const url = closestHTMLPage.getUrl();
		const title = closestHTMLPage.getTitle();

		if (url !== null && title !== null) {
			parentpageAnchorElement.href = url;
			parentpageAnchorElement.textContent = title;
			parentpageMessageElement.hidden = false;

			if (supportPortalElement) {
				parentpagePortalElement.src = url;
				parentpagePortalElement.title = title;
			}
		}
	});
}
