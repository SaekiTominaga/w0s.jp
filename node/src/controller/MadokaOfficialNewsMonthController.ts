import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import dayjs from 'dayjs';
import fs from 'fs';
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
		const requestQuery: MadokaOfficialNewsMonthRequest.PageQuery = {
			month: dayjs(new Date(Number((<string>req.params.month).substring(0, 4)), Number((<string>req.params.month).substring(5, 7)) - 1)),
		};

		const dao = new MadokaOfficialNewsMonthDao(this.#configCommon);

		const [newsListMovie, newsListTv, prevMonth, nextMonth] = await Promise.all([
			/* ニュース記事一覧 */
			dao.getNewsListMovie(requestQuery.month),
			dao.getNewsListTv(requestQuery.month),

			/* 前後のニュース記事がある月 */
			dao.getPrevMonthDate(requestQuery.month),
			dao.getNextMonthDate(requestQuery.month),
		]);

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
		});
	}
}
