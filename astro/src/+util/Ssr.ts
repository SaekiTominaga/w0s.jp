import fs from 'node:fs';
import path from 'node:path';
import type { AstroGlobal } from 'astro';
import Log4js from 'log4js';
import type { Astro as Configure } from '../../../configure/type/astro.js';

interface Options {
	dev: boolean;
}

export default class SsrUtil {
	/**
	 * SSR ページの初期処理
	 *
	 * @param Astro - `Astro` global <https://docs.astro.build/en/reference/api-reference/#astro-global>
	 * @param options - オプション
	 * @param options.dev - `import.meta.env.DEV` <https://docs.astro.build/en/guides/environment-variables/#default-environment-variables>
	 *
	 * @returns 共通で使用されるデータ
	 */
	static init = async (
		Astro: AstroGlobal,
		options: Options,
	): Promise<{
		configure: Configure;
		logger: Log4js.Logger;
	}> => {
		Astro.response.headers.set('Content-Type', 'text/html;charset=utf-8');

		/* Log4js */
		Log4js.configure(options.dev ? 'log4js.dev.config.json' : '../astro/log4js.prod.config.json');
		const logger = Log4js.getLogger(Astro.url.pathname);

		/* Configure */
		const configure = JSON.parse((await fs.promises.readFile('../configure/astro.json')).toString()) as Configure;

		return {
			configure: configure,
			logger: logger,
		};
	};

	/**
	 * Astro.url を元にページ URL を組み立てる
	 *
	 * @param astroUrl - Astro.url <https://docs.astro.build/en/reference/api-reference/#astrourl>
	 *
	 * @returns ページ URL
	 */
	static getPageUrl = async (astroUrl: URL): Promise<string> => {
		const astroPathname = astroUrl.pathname;

		const parsed = path.parse(astroPathname);
		if (parsed.ext === '') {
			/* 拡張子がない場合（開発環境ないしトップページ） */
			return astroPathname;
		}

		const dir = parsed.dir === '/' ? '' : parsed.dir;

		/* 拡張子を除去する */
		const urlExclusionExt = `${dir}/${parsed.name}`;

		try {
			await fs.promises.access(`${urlExclusionExt}/`);
			return `${urlExclusionExt}/`;
		} catch {}

		return urlExclusionExt;
	};
}
