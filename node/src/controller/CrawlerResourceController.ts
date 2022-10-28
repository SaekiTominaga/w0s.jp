import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import CrawlerResourceDao from '../dao/CrawlerResourceDao.js';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import RequestUtil from '../util/RequestUtil.js';
import { NoName as Configure } from '../../configure/type/crawler-resource.js';
import { Request, Response } from 'express';
import { W0SJp as ConfigureCommon } from '../../configure/type/common.js';

/**
 * ウェブ巡回（リソース）
 */
export default class CrawlerResourceController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;
	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/crawler-resource.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		const requestQuery: CrawlerResourceRequest.Index = {
			url: RequestUtil.string(req.query.url ?? req.body.url),
			title: RequestUtil.string(req.body.title),
			category: RequestUtil.number(req.body.category),
			priority: RequestUtil.number(req.body.priority),
			browser: RequestUtil.boolean(req.body.browser),
			selector: RequestUtil.string(req.body.selector),
			action_add: RequestUtil.boolean(req.body.actionadd),
			action_revise: RequestUtil.boolean(req.body.actionrev),
			action_revise_preview: RequestUtil.boolean(req.query.actionrevpre),
			action_delete: RequestUtil.boolean(req.body.actiondel),
		};

		const dao = new CrawlerResourceDao(this.#configCommon);

		if (requestQuery.action_add) {
			/* 登録 */
			if (requestQuery.url === null || requestQuery.title === null || requestQuery.category === null || requestQuery.priority === null) {
				this.logger.warn('データ登録時に必要なパラメーターが指定されていない');
				httpResponse.send403();
				return;
			}

			await dao.insert(requestQuery.url, requestQuery.title, requestQuery.category, requestQuery.priority, requestQuery.browser, requestQuery.selector);
			this.logger.info('データ登録', requestQuery.url);

			httpResponse.send303(); // 初期画面に遷移
			return;
		} else if (requestQuery.action_revise) {
			/* 修正実行 */
			if (requestQuery.url === null || requestQuery.title === null || requestQuery.category === null || requestQuery.priority === null) {
				this.logger.warn('データ修正時に必要なパラメーターが指定されていない');
				httpResponse.send403();
				return;
			}

			await dao.update(requestQuery.url, requestQuery.title, requestQuery.category, requestQuery.priority, requestQuery.browser, requestQuery.selector);
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
			requestQuery.selector = reviseData.selector;
		}

		/* 初期表示 */
		const categoryMaster = await dao.getCategoryMaster(); // カテゴリー情報
		const priorityMaster = await dao.getPriorityMaster(); // 優先度情報
		const resourcePageList = await dao.getResourcePageList(); // 巡回ページデータ

		const resourcePageListView: Map<string, CrawlerResourceView.News[]> = new Map();
		for (const resoursePage of resourcePageList) {
			const categoryName = resoursePage.category;

			const resourcePageOfCategoryView = resourcePageListView.get(categoryName) ?? [];
			resourcePageOfCategoryView.push({
				url: new URL(resoursePage.url),
				title: resoursePage.title,
				priority: resoursePage.priority,
				browser: resoursePage.browser,
				selector: resoursePage.selector,
				content_length: resoursePage.content_length,
				last_modified: resoursePage.last_modified,
			});

			resourcePageListView.set(categoryName, resourcePageOfCategoryView);
		}

		/* レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(this.#config.view.init, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			categoryMaster: categoryMaster,
			priorityMaster: priorityMaster,
			resourcePageList: resourcePageListView,
		});
	}
}
