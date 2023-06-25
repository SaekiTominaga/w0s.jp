import { query, Result, ValidationError, validationResult } from 'express-validator';
import { Request } from 'express';
import { NoName as Configure } from '../../../configure/type/tokyu-car-history.js';

/**
 * 東急電車形態研究・車歴表
 */
export default class TokyuCarHistoryValidator {
	#req: Request;

	#config: Configure;

	/**
	 * @param req - Request
	 * @param config - 設定ファイル
	 */
	constructor(req: Request, config: Configure) {
		this.#req = req;
		this.#config = config;
	}

	/**
	 * 検索実行
	 *
	 * @returns 検証エラー
	 */
	async search(): Promise<Result<ValidationError>> {
		await Promise.all([
			query('num').matches(new RegExp(this.#config.validator.number.regexp, 'i')).withMessage(this.#config.validator.number.message.format).run(this.#req),
			query('res').optional({ checkFalsy: true }).isDate().withMessage(this.#config.validator.register_start.message.format).run(this.#req),
			query('ree').optional({ checkFalsy: true }).isDate().withMessage(this.#config.validator.register_end.message.format).run(this.#req),
		]);

		return validationResult(this.#req);
	}
}
