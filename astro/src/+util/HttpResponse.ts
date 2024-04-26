import StringEscapeHtml from '@w0s/html-escape';

export default class HttpResponseUtil {
	readonly #request: Request;

	/**
	 * @param request - Request
	 */
	constructor(request: Request) {
		this.#request = request;
	}

	/**
	 * 303 See Other
	 *
	 * @param url - 遷移先 URL
	 *
	 * @returns Response
	 */
	response303 = (url?: string): Response => {
		if (url === undefined && this.#request.method === 'GET') {
			/* 無限ループ回避 */
			throw new Error(`The request URL and 303 redirect destination are the same (${this.#request.url}), risking an infinite loop.`);
		}

		const locationUrl = url ?? this.#request.url;
		const locationUrlEscapedHtml = StringEscapeHtml.escape(locationUrl);

		return new Response(
			`<!doctype html>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>See Other</title>
<h1>303 See Other</h1>
<p><a href="${locationUrlEscapedHtml}">${locationUrlEscapedHtml}</a>`,
			{
				status: 303,
				headers: {
					'Content-Type': 'text/html;charset=utf-8',
					Location: locationUrl,
				},
			},
		);
	};
}
