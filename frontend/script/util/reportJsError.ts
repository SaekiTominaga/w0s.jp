import reportJsError from '@w0s/report-js-error';

/**
 * JS error report
 */
export default (): void => {
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
				allows: [/^https:\/\/w0s\.jp\/assets\/script\/$/u],
			},
			ua: {
				denys: [/Googlebot\/2.1;/u],
			},
		},
	});
};
