import fs from 'node:fs';
import path from 'node:path';
import Log4js from 'log4js';
import log4jsConfigure from '../../log4js.config.json';
import configure from '../../../configure/astro.json';
import type { Astro as Configure } from '../../../configure/type/astro.d.js';

export default class SsrUtil {
	/**
	 * SSR ページの初期処理
	 *
	 * @param name - サイト内でユニークなページの名前
	 *
	 * @returns 共通で使用されるデータ
	 */
	static init = async (
		name: string,
	): Promise<{
		configure: Configure;
		logger: Log4js.Logger;
	}> => {
		/* Configure file */

		/* Log4js */
		Log4js.configure(log4jsConfigure);
		const logger = Log4js.getLogger(name);

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
