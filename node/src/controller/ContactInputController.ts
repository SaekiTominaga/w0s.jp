import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import fs from 'fs';
import { NoName as Configure } from '../../configure/type/contact';
import { Request, Response } from 'express';

/**
 * 問い合わせ・入力
 */
export default class ContactInputController extends Controller implements ControllerInterface {
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
		const referrer = req.headers.referer;
		let referrerRootRelativePath: string | null = null; // リファラーのいわゆるルート相対パス部分
		if (referrer !== undefined) {
			try {
				const referrerUrl = new URL(referrer);
				if (req.hostname === referrerUrl.hostname) {
					referrerRootRelativePath = referrer.substring(referrerUrl.origin.length);
				}
			} catch {
				this.logger.warn('不正なリファラー', referrer);
			}
		}

		const requestQuery: ContactRequest.InputQuery = {
			name: null,
			email: null,
			reply: null,
			body: null,
			referrer: referrerRootRelativePath,
			action_send: false,
		};

		/* 入力画面レンダリング */
		res.render(this.#config.view.input, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			validateErrors: [],
			reply: this.#config.reply,
		});
	}
}
