import path from 'node:path';
import type { AstroGlobal } from 'astro';
import * as dotenv from 'dotenv';
import Log4js from 'log4js';

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

	dotenv.config({
		path: !options.dev ? '../.env.production' : '../.env.development',
	});

	/* Logger */
	const loggerFilePath = process.env['LOGGER'];
	if (loggerFilePath === undefined) {
		throw new Error('Logger file path not defined');
	}
	Log4js.configure(loggerFilePath);
	const logger = Log4js.getLogger(Astro.url.pathname);

	return { logger };
};

/**
 * `Astro.url` を元にページ URL を組み立てる
 *
 * @param astroUrl - Astro.url <https://docs.astro.build/en/reference/api-reference/#astrourl>
 * @param astroFilePath - Astro.self.moduleId
 *
 * @returns ページ URL
 */
export const getPageUrl = (astroUrl: URL, astroFilePath: string | undefined): string => {
	const astroPathname = astroUrl.pathname;

	const urlParsed = path.parse(astroPathname);
	if (urlParsed.ext === '') {
		/* 拡張子がない場合（開発環境ないしトップページ） */
		return astroPathname;
	}

	const dir = urlParsed.dir === '/' ? '' : urlParsed.dir;

	/* 拡張子を除去する */
	const urlExclusionExt = `${dir}/${urlParsed.name}`;

	if (astroFilePath !== undefined) {
		if (path.basename(astroFilePath) === 'index.astro') {
			/* トップページ以外のインデックスページ */
			return `${urlExclusionExt}/`;
		}
	}

	return urlExclusionExt;
};
