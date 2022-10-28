import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import MadokaOfficialNewsIndexDao from '../dao/MadokaOfficialNewsIndexDao.js';
import RequestUtil from '../util/RequestUtil.js';
import { NoName as Configure } from '../../configure/type/madoka-official-news.js';
import { Request, Response } from 'express';
import { W0SJp as ConfigureCommon } from '../../configure/type/common.js';

/**
 * まどか☆マギカ・公式サイトニュース index ページ
 */
export default class MadokaOfficialNewsIndexController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;
	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/madoka-official-news.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const requestQuery: MadokaOfficialNewsMonthRequest.Index = {
			month: RequestUtil.string(req.query.month),
		};

		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		if (requestQuery.month !== null) {
			httpResponse.send301(requestQuery.month);
			return;
		}

		const dao = new MadokaOfficialNewsIndexDao(this.#configCommon);

		const [newsListMovie, newsListTv, monthDataList] = await Promise.all([
			/* ニュース記事一覧 */
			dao.getNewsListMovie(),
			dao.getNewsListTv(),

			/* 月ごとのニュース件数 */
			dao.getMonthData(),
		]);

		/* 月ごとのニュース件数 */
		const monthDataView: Map<number, Map<number, number>> = new Map();
		for (const monthData of monthDataList) {
			const date = monthData.date;
			const year = date.getFullYear();
			const month = date.getMonth() + 1;

			const monthDataYear = monthDataView.get(year);
			if (monthDataYear === undefined) {
				monthDataView.set(year, new Map([[month, monthData.count]]));
			} else {
				const monthDataMonth = monthDataYear.get(month);
				if (monthDataMonth === undefined) {
					monthDataYear.set(month, monthData.count);
				} else {
					monthDataYear.set(month, monthDataMonth + monthData.count);
				}

				monthDataView.set(year, monthDataYear);
			}
		}

		/* レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(this.#config.view.init, {
			page: {
				path: req.path,
			},
			newsListMovie: newsListMovie, // ニュース記事一覧（劇場版）
			newsListTv: newsListTv, // ニュース記事一覧（TVシリーズ）
			monthDataList: monthDataView, // 月ごとのニュース件数
		});
	}
}
