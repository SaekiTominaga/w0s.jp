import { loadEnvFile } from 'node:process';
import { defineMiddleware } from 'astro:middleware';
import * as cheerio from 'cheerio';
import URLSearchParamsCustomSeparator from '@w0s/urlsearchparams-custom-separator';
import { getLogger } from './logger.ts';

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

	if (context.isPrerendered) {
		const $ = cheerio.load(await response.text());

		if (!import.meta.env.DEV) {
			/* `<link rel="stylesheet">` の位置をまとめる */
			const $linkStylesheets = $('head > link[rel~="stylesheet"]');
			if ($linkStylesheets.length >= 2) {
				const $astroStylesheet = $linkStylesheets.last();
				$astroStylesheet.insertAfter($linkStylesheets.eq(-2));
			}
		}

		/* `<Image>` で自動的に設定される属性を回避するため <MyImage> でデフォルト属性を設定しているためそれらを削除 <https://docs.astro.build/en/reference/modules/astro-assets/#image-> */
		const $images = $('img');
		$images.each((_index, image) => {
			const $image = $(image);
			if ($image.attr('decoding') === 'auto') {
				$image.removeAttr('decoding');
			}
			if ($image.attr('loading') === 'eager') {
				$image.removeAttr('loading');
			}
			if ($image.attr('fetchpriority') === 'auto') {
				$image.removeAttr('fetchpriority');
			}
		});

		return new Response($.html(), {
			status: status,
			statusText: statusText,
			headers: headers,
		});
	}

	return new Response(body, {
		status: status,
		statusText: statusText,
		headers: headers,
	});
});
