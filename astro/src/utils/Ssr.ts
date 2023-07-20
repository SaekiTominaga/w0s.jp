import Log4js from 'log4js';
import log4jsConfigure from '../../log4js.json';
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
}
