import { Amazon as Configure } from '../../configure/type/amazon-ads.js';
import { body, Result, ValidationError, validationResult } from 'express-validator';
import { Request } from 'express';

/**
 * Amazon 商品広告管理
 */
export default class AmazonAdsValidator {
	#req: Request;
	#config: Configure;

	/**
	 * @param {Request} req - Request
	 * @param {Configure} config - 設定ファイル
	 */
	constructor(req: Request, config: Configure) {
		this.#req = req;
		this.#config = config;
	}

	/**
	 * 新規追加
	 *
	 * @returns {Result<ValidationError>} 検証エラー
	 */
	async add(): Promise<Result<ValidationError>> {
		await body('category')
			.notEmpty()
			.withMessage(this.#config.validator.category.message.required)
			.run(this.#req);

		return validationResult(this.#req);
	}
}
