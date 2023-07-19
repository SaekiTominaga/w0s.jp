import Log4js from 'log4js';
import configure from '../../configure/common.json';
import log4jsConfigure from '../../log4js.json';
import type { W0SJp as Configure } from '../../configure/type/common.js';

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
