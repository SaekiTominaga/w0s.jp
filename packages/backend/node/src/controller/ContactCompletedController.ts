import fs from 'node:fs';
import ejs from 'ejs';
import { Request, Response } from 'express';
import HtmlStructuredData from '@w0s.jp/util/dist/HtmlStructuredData.js';
import ContactValidator from '../validator/ContactValidator.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import RequestUtil from '../util/RequestUtil.js';
import { NoName as Configure } from '../../../configure/type/contact.js';
import { W0SJp as ConfigureCommon } from '../../../configure/type/common.js';

/**
 * 問い合わせ・完了
 */
export default class ContactCompletedController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;

	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = JSON.parse(fs.readFileSync('configure/contact.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const requestQuery: ContactRequest.Completed = {
			referrer: RequestUtil.string(req.query['referrer']),
		};

		const validator = new ContactValidator(req, this.#config);
		const validationResult = await validator.completed();
		if (validationResult.mapped()['referrer'] !== undefined) {
			this.logger.warn('不正なリファラー', requestQuery.referrer);
			requestQuery.referrer = null;
		}

		const htmlPath = `${this.#configCommon.html}/${this.#config.view.completed}`;

		const structuredData = await HtmlStructuredData.getForJson(htmlPath); // 構造データ

		/* EJS を解釈 */
		const main = await ejs.renderFile(htmlPath, {
			requestQuery: requestQuery,
		});

		/* 完了画面レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(structuredData.template.name, {
			pagePathAbsoluteUrl: req.path, // U+002F (/) から始まるパス絶対 URL
			structuredData: structuredData,
			main: main,
		});
	}
}