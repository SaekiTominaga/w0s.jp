import { body, query, Result, ValidationError, validationResult } from 'express-validator';
import { Request } from 'express';
import { NoName as Configure } from '../../configure/type/contact.js';

/**
 * 問い合わせ
 */
export default class ContactValidator {
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
	 * 送信実行
	 *
	 * @returns {Result<ValidationError>} 検証エラー
	 */
	async send(): Promise<Result<ValidationError>> {
		await body('email')
			.notEmpty()
			.withMessage(this.#config.validator.email.message.required)
			.isEmail()
			.withMessage(this.#config.validator.email.message.format)
			.run(this.#req);
		await body('reply')
			.notEmpty()
			.withMessage(this.#config.validator.reply.message.required)
			.isIn(Object.keys(this.#config.reply))
			.withMessage(this.#config.validator.reply.message.value)
			.run(this.#req);
		await body('body')
			.notEmpty()
			.withMessage(this.#config.validator.body.message.required)
			.run(this.#req);

		return validationResult(this.#req);
	}

	/**
	 * 完了
	 *
	 * @returns {Result<ValidationError>} 検証エラー
	 */
	async completed(): Promise<Result<ValidationError>> {
		await query('referrer')
			.optional({ checkFalsy: true })
			.matches(/^\/.*$/)
			.run(this.#req);

		return validationResult(this.#req);
	}
}
