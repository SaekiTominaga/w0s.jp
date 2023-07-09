import fs from 'node:fs';
import ejs from 'ejs';
import type { Request, Response } from 'express';
import HtmlStructuredData from '@w0s.jp/util/dist/HtmlStructuredData.js';
import Controller from '../Controller.js';
import type ControllerInterface from '../ControllerInterface.js';
import type { NoName as Configure } from '../../../configure/type/contact.js';
import type { W0SJp as ConfigureCommon } from '../../../configure/type/common.js';

/**
 * 問い合わせ・入力
 */
export default class ContactInputController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;

	#config: Configure;

	/**
	 * @param configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = JSON.parse(fs.readFileSync('configure/contact.json', 'utf8'));
	}

	/**
	 * @param req - Request
	 * @param res - Response
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

		const requestQuery: ContactRequest.Input = {
			name: null,
			email: null,
			reply: null,
			body: null,
			referrer: referrerRootRelativePath,
			action_send: false,
		};

		const htmlPath = `${this.#configCommon.html}/${this.#config.view.input}`;

		const structuredData = await HtmlStructuredData.getForJson(htmlPath); // 構造データ

		/* EJS を解釈 */
		const main = await ejs.renderFile(htmlPath, {
			requestQuery: requestQuery,
			validateErrors: [],
			reply: this.#config.reply,
		});

		/* 入力画面レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(structuredData.template.name, {
			pagePathAbsoluteUrl: req.path, // U+002F (/) から始まるパス絶対 URL
			structuredData: structuredData,
			jsonLd: HtmlStructuredData.getJsonLd(structuredData),
			main: main,
		});
	}
}
