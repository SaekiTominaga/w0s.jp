import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import MadokaOfficialNewsIndexDao from '../dao/MadokaOfficialNewsIndexDao.js';
import { NoName as Configure } from '../../configure/type/madoka-official-news';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';
import { Request, Response } from 'express';

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
		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		if (req.query.month !== undefined && typeof req.query.month === 'string') {
			httpResponse.send301(req.query.month);
			return;
		}

		const dao = new MadokaOfficialNewsIndexDao(this.#configCommon);

		/* ニュース記事一覧 */
		const newsList = await Promise.all([dao.getNewsListMovie(), dao.getNewsListTv()]);
		const newsListMovie = newsList[0];
		const newsListTv = newsList[1];

		/* 月ごとのニュース件数 */
		const monthDataList = await dao.getMonthData();
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
