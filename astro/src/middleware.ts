import { loadEnvFile } from 'node:process';
import { defineMiddleware } from 'astro:middleware';
import Log4js from 'log4js';
import { env } from '@w0s/env-value-type';
import URLSearchParamsCustomSeparator from '@w0s/urlsearchparams-custom-separator';

export const onRequest = defineMiddleware(async (context, next) => {
	/* SSG ページ */
	if (context.isPrerendered) {
		return next();
	}

	loadEnvFile(!import.meta.env.DEV ? '../.env.production' : '../.env.development');

	/* Logger */
	Log4js.configure(`${env('ROOT')}/${env('ASTRO_LOG4JS_CONF')}`);
	const logger = Log4js.getLogger(context.url.pathname);
	context.locals.logger = logger;

	/* URLSearchParams */
	context.locals.requestParams = new URLSearchParamsCustomSeparator(context.url, [';']).searchParams;

	const response = await next();

	const { status, statusText, headers, body } = response;
	headers.set('Content-Type', 'text/html;charset=utf-8');

	return new Response(body, {
		status: status,
		statusText: statusText,
		headers: headers,
	});
});
