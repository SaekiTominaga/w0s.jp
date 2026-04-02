import { loadEnvFile } from 'node:process';
import { defineMiddleware } from 'astro:middleware';
import * as cheerio from 'cheerio';
import URLSearchParamsCustomSeparator from '@w0s/urlsearchparams-custom-separator';
import { getLogger } from '../logger.ts';
import { removeImageDefaultAttribute } from './image.ts';
import { adjustLinkStylesheetPosition } from './stylesheet.ts';

export const onRequest = defineMiddleware(async (context, next) => {
	if (!context.isPrerendered) {
		loadEnvFile(!import.meta.env.DEV ? '../.env.production' : '../.env.development');

		/* Logger */
		const logger = getLogger(context.url.pathname);
		context.locals.logger = logger;

		/* URLSearchParams */
		context.locals.requestParams = new URLSearchParamsCustomSeparator(context.url, [';']).searchParams;
	}

	const response = await next();
	const { status, statusText, headers, body } = response;

	const contentType = headers.get('Content-Type');
	if (contentType !== null && ['text/html'].includes(contentType)) {
		headers.set('Content-Type', `${contentType};charset=utf-8`);
	}

	if (!context.isPrerendered) {
		return new Response(body, {
			status: status,
			statusText: statusText,
			headers: headers,
		});
	}

	const $ = cheerio.load(await response.text());

	if (!import.meta.env.DEV) {
		/* `<link rel="stylesheet">` の位置をまとめる */
		adjustLinkStylesheetPosition($);
	}

	/* `<Image>` で自動的に設定される属性を回避するため <MyImage> でデフォルト属性を設定しているためそれらを削除 <https://docs.astro.build/en/reference/modules/astro-assets/#image-> */
	removeImageDefaultAttribute($);

	return new Response($.html(), {
		status: status,
		statusText: statusText,
		headers: headers,
	});
});
