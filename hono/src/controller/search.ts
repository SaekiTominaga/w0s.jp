import { Hono } from 'hono';
import { escape } from '@w0s/html-escape';
import type { Variables } from '../app.ts';
import { type Engine, type Site, param as validatorParam } from '../validator/search.ts';

/**
 * 検索
 */

const getSite = (param: Site): string => {
	switch (param) {
		case 'www': {
			return 'w0s.jp';
		}
		case 'blog': {
			return 'blog.w0s.jp';
		}
		default:
	}
	throw new Error(); // 到達不能
};

const getURL = (params: Readonly<{ site: Site; engine: Engine; q: string }>): string => {
	const { site, engine, q } = params;

	const urlSearchParams = new URLSearchParams();

	switch (engine) {
		case 'google': {
			urlSearchParams.append('as_sitesearch', getSite(site)); // https://brightdata.com/blog/web-data/google-search-url-parameters#title-29
			urlSearchParams.append('q', q);

			return `https://www.google.com/search?${urlSearchParams.toString()}`;
		}
		case 'bing': {
			urlSearchParams.append('q', `${q} site:${getSite(site)}`); // https://support.microsoft.com/en-us/bing/advanced-search-keywords

			return `https://www.bing.com/search?${urlSearchParams.toString()}`;
		}
		case 'yahoo': {
			urlSearchParams.append('p', `${q} site:${getSite(site)}`);

			return `https://search.yahoo.co.jp/search?${urlSearchParams.toString()}`;
		}
		case 'ddg': {
			urlSearchParams.append('q', `${q} site:${getSite(site)}`);

			return `https://duckduckgo.com/?${urlSearchParams.toString()}`;
		}
		default:
	}
	throw new Error(); // 到達不能
};

export const searchApp = new Hono<{ Variables: Variables }>().get(validatorParam, (context) => {
	const { req } = context;

	const { site, engine, q } = req.valid('query');

	const redirectUrl = getURL({ site, engine, q });

	return context.html(
		`<!DOCTYPE html>
	<html lang=ja>
	<meta name=viewport content="width=device-width,initial-scale=1">
	<title>ページ移動</title>
	<p>検索結果は次の URL で取得できます。 <a href="${escape(redirectUrl)}"><code>${escape(redirectUrl)}</code></a>`,
		301,
		{ Location: redirectUrl },
	);
});
