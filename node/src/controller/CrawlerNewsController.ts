import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import CrawlerNewsDao from '../dao/CrawlerNewsDao.js';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import RequestUtil from '../util/RequestUtil.js';
import { NoName as Configure } from '../../configure/type/crawler-news';
import { Request, Response } from 'express';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';

/**
 * ウェブ巡回（ニュース）
 */
export default class CrawlerNewsController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;
	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/crawler-news.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		const requestQuery: CrawlerNewsRequest.Index = {
			url: RequestUtil.string(req.query.url ?? req.body.url),
			title: RequestUtil.string(req.body.title),
			category: RequestUtil.number(req.body.category),
			priority: RequestUtil.number(req.body.priority),
			browser: RequestUtil.boolean(req.body.browser),
			selector_wrap: RequestUtil.string(req.body.selectorwrap),
			selector_date: RequestUtil.string(req.body.selectordate),
			selector_content: RequestUtil.string(req.body.selectorcontent),
			action_add: RequestUtil.boolean(req.body.actionadd),
			action_revise: RequestUtil.boolean(req.body.actionrev),
			action_revise_preview: RequestUtil.boolean(req.query.actionrevpre),
			action_delete: RequestUtil.boolean(req.body.actiondel),
		};

		const dao = new CrawlerNewsDao(this.#configCommon);

		if (requestQuery.action_add) {
			/* 登録 */
			if (
				requestQuery.url === null ||
				requestQuery.title === null ||
				requestQuery.category === null ||
				requestQuery.priority === null ||
				requestQuery.selector_wrap === null
			) {
				this.logger.warn('データ登録時に必要なパラメーターが指定されていない');
				httpResponse.send403();
				return;
			}

			await dao.insert(
				requestQuery.url,
				requestQuery.title,
				requestQuery.category,
				requestQuery.priority,
				requestQuery.browser,
				requestQuery.selector_wrap,
				requestQuery.selector_date,
				requestQuery.selector_content
			);
			this.logger.info('データ登録', requestQuery.url);

			httpResponse.send303(); // 初期画面に遷移
			return;
		} else if (requestQuery.action_revise) {
			/* 修正実行 */
			if (
				requestQuery.url === null ||
				requestQuery.title === null ||
				requestQuery.category === null ||
				requestQuery.priority === null ||
				requestQuery.selector_wrap === null
			) {
				this.logger.warn('データ修正時に必要なパラメーターが指定されていない');
				httpResponse.send403();
				return;
			}

			await dao.update(
				requestQuery.url,
				requestQuery.title,
				requestQuery.category,
				requestQuery.priority,
				requestQuery.browser,
				requestQuery.selector_wrap,
				requestQuery.selector_date,
				requestQuery.selector_content
			);
			this.logger.info('データ更新', requestQuery.url);

			httpResponse.send303(); // 初期画面に遷移
			return;
		} else if (requestQuery.action_delete) {
			/* 削除 */
			if (requestQuery.url === null) {
				this.logger.warn('データ削除時に URL が指定されていない');
				httpResponse.send403();
				return;
			}

			await dao.delete(requestQuery.url);
			this.logger.info('データ削除', requestQuery.url);

			httpResponse.send303(); // 初期画面に遷移
			return;
		} else if (requestQuery.action_revise_preview) {
			/* 修正データ選択 */
			if (requestQuery.url === null) {
				this.logger.warn('修正データ選択時に URL が指定されていない');
				httpResponse.send403();
				return;
			}

			const reviseData = await dao.getReviseData(requestQuery.url);
			if (reviseData === null) {
				this.logger.warn('修正データが取得できない', requestQuery.url);
				httpResponse.send403();
				return;
			}

			requestQuery.title = reviseData.title;
			requestQuery.category = reviseData.category;
			requestQuery.priority = reviseData.priority;
			requestQuery.browser = reviseData.browser;
			requestQuery.selector_wrap = reviseData.selector_wrap;
			requestQuery.selector_date = reviseData.selector_date;
			requestQuery.selector_content = reviseData.selector_content;
		}

		/* 初期表示 */
		const categoryMaster = await dao.getCategoryMaster(); // カテゴリー情報
		const priorityMaster = await dao.getPriorityMaster(); // 優先度情報
		const newsPageList = await dao.getNewsPageList(); // 巡回ページデータ

		const newsPageListView: Map<string, CrawlerNewsView.News[]> = new Map();
		for (const newsPage of newsPageList) {
			const categoryName = newsPage.category;

			const newsPageOfCategoryView = newsPageListView.get(categoryName) ?? [];
			newsPageOfCategoryView.push({
				url: newsPage.url,
				title: newsPage.title,
				priority: newsPage.priority,
				browser: newsPage.browser,
				selector_wrap: newsPage.selector_wrap,
				selector_date: newsPage.selector_date,
				selector_content: newsPage.selector_content,
			});

			newsPageListView.set(categoryName, newsPageOfCategoryView);
		}

		/* レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(this.#config.view.page, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			categoryMaster: categoryMaster,
			priorityMaster: priorityMaster,
			newsPageList: newsPageListView,
		});
	}
}
