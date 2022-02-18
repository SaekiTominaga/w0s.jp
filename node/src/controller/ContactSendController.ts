import ContactValidator from '../validator/ContactValidator.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import ejs from 'ejs';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import nodemailer from 'nodemailer';
import { NoName as Configure } from '../../configure/type/contact';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';
import { Request, Response } from 'express';
import { Result as ValidationResult, ValidationError } from 'express-validator';
import RequestUtil from '../util/RequestUtil.js';

/**
 * 問い合わせ・送信
 */
export default class ContactSendController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;
	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/contact.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const requestQuery: ContactRequest.Input = {
			name: RequestUtil.string(req.body.yourname),
			email: RequestUtil.string(req.body.email),
			reply: RequestUtil.string(req.body.reply),
			body: RequestUtil.string(req.body.body),
			referrer: RequestUtil.string(req.body.referrer),
			action_send: RequestUtil.boolean(req.body.actionsend),
		};

		const validator = new ContactValidator(req, this.#config);
		let validationResult: ValidationResult<ValidationError> | null = null;

		if (requestQuery.action_send) {
			validationResult = await validator.send();
			if (validationResult.isEmpty()) {
				/* メール送信 */
				await this.sendMail(req, requestQuery);

				/* 完了画面へ */
				const httpResponse = new HttpResponse(req, res, this.#configCommon);
				httpResponse.send303(
					requestQuery.referrer === null || requestQuery.referrer === ''
						? this.#config.url.completed.pathname
						: `${this.#config.url.completed.pathname}?${this.#config.url.completed.search.referrer}=${encodeURIComponent(requestQuery.referrer)}`
				);
				return;
			}
		}

		/* 入力画面レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(this.#config.view.input, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			validateErrors: validationResult?.array({ onlyFirstError: true }) ?? [],
			reply: this.#config.reply,
		});
	}

	/**
	 * メール送信
	 *
	 * @param {Request} req - Request
	 * @param {object} requestQuery - URL クエリー情報
	 */
	private async sendMail(req: Request, requestQuery: ContactRequest.Input): Promise<void> {
		const html = await ejs.renderFile(`${this.#configCommon.views}/${this.#config.view.mail}`, {
			page: {
				query: requestQuery,
			},
			reply: this.#config.reply,
			ip: req.ip,
			ua: req.get('User-Agent'),
		});

		const transporter = nodemailer.createTransport({
			host: this.#configCommon.mail.smtp,
			port: this.#configCommon.mail.port,
			auth: {
				user: this.#configCommon.mail.user,
				pass: this.#configCommon.mail.password,
			},
		});

		const info = await transporter.sendMail({
			from: this.#configCommon.mail.from,
			to: this.#configCommon.mail.to,
			subject: this.#config.mail.subject,
			html: html,
		});

		this.logger.info('Message sent: %s', info.messageId);
	}
}
