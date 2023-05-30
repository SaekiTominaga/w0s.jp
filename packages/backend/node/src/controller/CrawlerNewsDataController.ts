import fs from 'node:fs';
import ejs from 'ejs';
import { Request, Response } from 'express';
import HtmlStructuredData from '@w0s.jp/util/dist/HtmlStructuredData.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import CrawlerNewsDataDao from '../dao/CrawlerNewsDataDao.js';
import HttpResponse from '../util/HttpResponse.js';
import RequestUtil from '../util/RequestUtil.js';
import { NoName as Configure } from '../../../configure/type/crawler-news.js';
import { W0SJp as ConfigureCommon } from '../../../configure/type/common.js';

/**
 * ウェブ巡回（ニュース）
 */
export default class CrawlerNewsDataController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;

	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = JSON.parse(fs.readFileSync('configure/crawler-news.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		const requestQuery: CrawlerNewsRequest.Data = {
			url: RequestUtil.string(req.query['url'] ?? req.body['url']),
			id: RequestUtil.string(req.body['id']),
			action_delete: RequestUtil.boolean(req.body['actiondel']),
		};

		const dao = new CrawlerNewsDataDao(this.#configCommon);

		if (requestQuery.action_delete) {
			/* 削除 */
			if (requestQuery.id === null) {
				this.logger.warn('データ削除時に ID が指定されていない');
				httpResponse.send403();
				return;
			}

			await dao.delete(requestQuery.id);
			this.logger.info('データ削除', requestQuery.id);

			httpResponse.send303(`?url=${requestQuery.url}`); // 初期画面に遷移
			return;
		}

		/* 初期表示 */
		if (requestQuery.url === null) {
			this.logger.warn('URL が指定されていない');
			httpResponse.send403();
			return;
		}

		const newsDataList = await dao.getNewsDataList(requestQuery.url); // 新着データ

		const htmlPath = `${this.#configCommon.html}/${this.#config.view.data}`;

		const structuredData = await HtmlStructuredData.getForJson(htmlPath); // 構造データ

		/* EJS を解釈 */
		const main = await ejs.renderFile(htmlPath, {
			pagePathAbsoluteUrl: req.path, // U+002F (/) から始まるパス絶対 URL
			requestQuery: requestQuery,
			newsDataList: newsDataList,
		});

		/* レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(structuredData.template.name, {
			pagePathAbsoluteUrl: req.path, // U+002F (/) から始まるパス絶対 URL
			structuredData: structuredData,
			main: main,
		});
	}
}