import { escape } from '@w0s/html-escape';

/**
 * 303 See Other
 *
 * @param request - Request
 * @param url - 遷移先 URL
 *
 * @returns Response
 */
export const response303 = (request: Request, url?: string): Response => {
	if (url === undefined && request.method === 'GET') {
		/* 無限ループ回避 */
		throw new Error(`The request URL and 303 redirect destination are the same (${request.url}), risking an infinite loop.`);
	}

	const locationUrl = url ?? request.url;

	return new Response(
		`<!DOCTYPE html>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>See Other</title>
<h1>303 See Other</h1>
<p><a href="${escape(locationUrl)}">${escape(locationUrl)}</a>`,
		{
			status: 303,
			headers: {
				'Content-Type': 'text/html;charset=utf-8',
				Location: locationUrl,
			},
		},
	);
};

/**
 * 400 Bad Request
 *
 * @returns Response
 */
export const response400 = (): Response =>
	new Response(
		`<!DOCTYPE html>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>w0s.jp</title>
<h1>Client error</h1>`,
		{
			status: 400,
			headers: {
				'Content-Type': 'text/html;charset=utf-8',
			},
		},
	);
