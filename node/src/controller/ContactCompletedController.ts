import ContactValidator from '../validator/ContactValidator.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import fs from 'fs';
import { NoName as Configure } from '../../configure/type/contact';
import { Request, Response } from 'express';

/**
 * 問い合わせ・完了
 */
export default class ContactCompletedController extends Controller implements ControllerInterface {
	#config: Configure;

	constructor() {
		super();

		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/contact.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const requestQuery: ContactRequest.CompletedQuery = {
			referrer: <string>req.query.referrer ?? null,
		};

		const validator = new ContactValidator(req, this.#config);
		const validationResult = await validator.completed();
		if (validationResult.mapped().referrer !== undefined) {
			this.logger.warn('不正なリファラー', requestQuery.referrer);
			requestQuery.referrer = null;
		}

		/* 完了画面レンダリング */
		res.render(this.#config.view.completed, {
			page: {
				path: req.path,
				query: requestQuery,
			},
		});
	}
}
