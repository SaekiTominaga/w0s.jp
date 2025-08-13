import { loadEnvFile } from 'node:process';
import type { AstroGlobal } from 'astro';
import Log4js from 'log4js';
import { env } from './env.js';

interface Options {
	dev: boolean;
}

/**
 * SSR ページの初期処理
 *
 * @param Astro - `Astro` global <https://docs.astro.build/en/reference/api-reference/#astro-global>
 * @param options - オプション
 * @param options.dev - `import.meta.env.DEV` <https://docs.astro.build/en/guides/environment-variables/#default-environment-variables>
 *
 * @returns 共通で使用されるデータ
 */
export const init = (Astro: AstroGlobal, options: Options): { logger: Log4js.Logger } => {
	Astro.response.headers.set('Content-Type', 'text/html;charset=utf-8');

	loadEnvFile(!options.dev ? '../.env.production' : '../.env.development');

	/* Logger */
	Log4js.configure(env('LOGGER'));
	const logger = Log4js.getLogger(Astro.url.pathname);

	return { logger };
};

/**
 * `Astro.url` を元にページ URL を組み立てる
 *
 * @param astroUrl - Astro.url <https://docs.astro.build/en/reference/api-reference/#url>
 * @param astroFilePath - Astro.self.moduleId
 *
 * @returns ページ URL
 */
export const getPageUrl = (astroUrl: URL, astroFilePath: string | undefined): string => {
	const astroPathname = astroUrl.pathname;

	/* build - format: 'preserve' の設定ではビルド時のみ末尾に / が付いてしまうので除去する */
	if (astroFilePath !== undefined && !astroFilePath.endsWith('/index.astro') && astroPathname.endsWith('/')) {
		return astroPathname.slice(0, -1);
	}

	return astroPathname;
};
