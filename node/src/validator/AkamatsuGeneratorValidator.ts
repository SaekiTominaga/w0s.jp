import { body, Result, ValidationError, validationResult } from 'express-validator';
import { NoName as Configure } from '../../configure/type/akamatsu-generator.js';
import { Request } from 'express';

/**
 * 赤松健セリフジェネレーター
 */
export default class AkamatsuGeneratorValidator {
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
	 * 生成実行
	 *
	 * @returns {Result<ValidationError>} 検証エラー
	 */
	async generate(): Promise<Result<ValidationError>> {
		await Promise.all([
			body('text_right1')
				.isLength({ max: this.#config.validator.text_right1.maxlength })
				.withMessage(this.#config.validator.text_right1.message.maxlength)
				.run(this.#req),
			body('text_right2')
				.isLength({ max: this.#config.validator.text_right2.maxlength })
				.withMessage(this.#config.validator.text_right2.message.maxlength)
				.run(this.#req),
			body('text_left1')
				.isLength({ max: this.#config.validator.text_left1.maxlength })
				.withMessage(this.#config.validator.text_left1.message.maxlength)
				.run(this.#req),
			body('text_left2')
				.isLength({ max: this.#config.validator.text_left2.maxlength })
				.withMessage(this.#config.validator.text_left2.message.maxlength)
				.run(this.#req),
			body('color').matches(new RegExp('#[0-9A-F]{6}', 'i')).withMessage(this.#config.validator.color.message.format).run(this.#req),
			body('bgcolor').matches(new RegExp('#[0-9A-F]{6}', 'i')).withMessage(this.#config.validator.bgcolor.message.format).run(this.#req),
		]);

		return validationResult(this.#req);
	}
}
