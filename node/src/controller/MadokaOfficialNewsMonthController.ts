import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import dayjs from 'dayjs';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import MadokaOfficialNewsMonthDao from '../dao/MadokaOfficialNewsMonthDao.js';
import { NoName as Configure } from '../../configure/type/madoka-official-news';
import { Request, Response } from 'express';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';
import { MadokaOfficialNewsMonthRequest } from '../../@types/madoka-official-news.js';

/**
 * まどか☆マギカ・公式サイトニュース 月ごとのページ
 */
export default class MadokaOfficialNewsMonthController extends Controller implements ControllerInterface {
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

		const requestQuery: MadokaOfficialNewsMonthRequest.PageQuery = {
			month: dayjs(new Date(Number(req.params.month.substring(0, 4)), Number(req.params.month.substring(5, 7)) - 1)),
		};

		const dao = new MadokaOfficialNewsMonthDao(this.#configCommon);
		const daoData = await Promise.all([
			dao.getNewsListMovie(requestQuery.month),
			dao.getNewsListTv(requestQuery.month),
			dao.getPrevMonthDate(requestQuery.month),
			dao.getNextMonthDate(requestQuery.month),
			dao.getMonthData(),
		]);

		/* ニュース記事一覧 */
		const newsListMovie = daoData[0];
		const newsListTv = daoData[1];

		/* 前後のニュース記事がある月 */
		const prevMonth = daoData[2];
		const nextMonth = daoData[3];

		/* 月ごとのニュース件数 */
		const monthDataList = daoData[4];
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
		res.render(this.#config.view.month, {
			page: {
				path: req.path,
				query: requestQuery,
			},

			newsListMovie: newsListMovie, // ニュース記事一覧（劇場版）
			newsListTv: newsListTv, // ニュース記事一覧（TVシリーズ）

			prevMonth: prevMonth,
			nextMonth: nextMonth,

			monthDataList: monthDataView, // 月ごとのニュース件数
		});
	}
}
