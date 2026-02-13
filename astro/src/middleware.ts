import { loadEnvFile } from 'node:process';
import { defineMiddleware } from 'astro:middleware';
import Log4js from 'log4js';
import { env } from '@w0s/env-value-type';
import URLSearchParamsCustomSeparator from '@w0s/urlsearchparams-custom-separator';

export const onRequest = defineMiddleware(async (context, next) => {
	const { status, statusText, headers, body } = await next();

	const contentType = headers.get('Content-Type');
	if (contentType !== null && ['text/html'].includes(contentType)) {
		headers.set('Content-Type', `${contentType};charset=utf-8`);
	}

	console.debug(import.meta);

	/* SSR ページ */
	if (!context.isPrerendered) {
		loadEnvFile(!import.meta.env.DEV ? '../.env.production' : '../.env.development');

		/* Logger */
		Log4js.configure(`${env('ROOT')}/${env('ASTRO_LOG4JS_CONF')}`);
		const logger = Log4js.getLogger(context.url.pathname);
		context.locals.logger = logger;

		/* URLSearchParams */
		context.locals.requestParams = new URLSearchParamsCustomSeparator(context.url, [';']).searchParams;
	}

	return new Response(body, {
		status: status,
		statusText: statusText,
		headers: headers,
	});
});
