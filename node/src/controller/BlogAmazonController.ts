import BlogAmazonDao from '../dao/BlogAmazonDao.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import { Amazon as Configure } from '../../configure/type/blog-amazon';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';
import { Request, Response } from 'express';

/**
 * 富永日記帳・ Amazon 商品管理
 */
export default class BlogAmazonController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;
	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/blog-amazon.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		const requestQuery: BlogAmazonRequest.InputQuery = {
			asin: req.body.asin ?? null,
			action_delete: Boolean(req.body.actiondel),
		};

		const dao = new BlogAmazonDao(this.#configCommon);

		if (requestQuery.action_delete) {
			/* 削除 */
			if (requestQuery.asin === null) {
				this.logger.warn('データ削除時に必要なパラメーターが指定されていない');
				httpResponse.send403();
				return;
			}

			dao.delete(requestQuery.asin);
			httpResponse.send303();
		}

		/* 初期表示 */
		const dpList = await dao.getDpList(); // 商品情報

		/* レンダリング */
		res.render(this.#config.view.init, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			dpList: dpList, // 商品情報
		});
	}
}
