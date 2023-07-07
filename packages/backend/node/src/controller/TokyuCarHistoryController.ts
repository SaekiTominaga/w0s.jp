import fs from 'node:fs';
import dayjs from 'dayjs';
import ejs from 'ejs';
import { Request, Response } from 'express';
import { Result as ValidationResult, ValidationError } from 'express-validator';
import HtmlStructuredData from '@w0s.jp/util/dist/HtmlStructuredData.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import RequestUtil from '../util/RequestUtil.js';
import TokyuCarHistoryDao from '../dao/TokyuCarHistoryDao.js';
import TokyuCarHistoryValidator from '../validator/TokyuCarHistoryValidator.js';
import { NoName as Configure } from '../../../configure/type/tokyu-car-history.js';
import { W0SJp as ConfigureCommon } from '../../../configure/type/common.js';

/**
 * 東急電車形態研究・車歴表
 */
export default class TokyuCarHistoryController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;

	#config: Configure;

	/**
	 * @param configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = JSON.parse(fs.readFileSync('configure/tokyu-car-history.json', 'utf8'));
	}

	/**
	 * @param req - Request
	 * @param res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const requestQuery: TokyuCarHistoryRequest.Search = {
			number: RequestUtil.string(req.query['num']),
			number_old: RequestUtil.boolean(req.query['old']),
			series: RequestUtil.strings(req.query['ser']),
			register_start: RequestUtil.string(req.query['res']),
			register_end: RequestUtil.string(req.query['ree']),
			sort: RequestUtil.string(req.query['srt']),
			era: RequestUtil.string(req.query['era']),
			output: RequestUtil.string(req.query['out']),
		};

		const validator = new TokyuCarHistoryValidator(req, this.#config);
		let validationResult: ValidationResult<ValidationError> | null = null;

		const dbFilePath = this.#configCommon.sqlite.db['tokyu_car_history'];
		if (dbFilePath === undefined) {
			throw new Error('共通設定ファイルに tokyu_car_history テーブルのパスが指定されていない。');
		}

		const dao = new TokyuCarHistoryDao(dbFilePath);

		let searchCarsCount = 0;
		const searchCarsView: TokyuCarHistoryView.SearchCar[][] = [];

		if (requestQuery.output !== null) {
			validationResult = await validator.search();
			if (validationResult.isEmpty()) {
				/* 検索実行 */
				const carDataList = await dao.getCarData(
					requestQuery.number,
					requestQuery.number_old,
					requestQuery.series,
					requestQuery.register_start,
					requestQuery.register_end,
					requestQuery.sort,
				);

				searchCarsCount = carDataList.length;

				let beforeSeries = '';
				for (const carData of carDataList) {
					const changeView: TokyuCarHistoryView.Change[] = [];
					if (carData.change !== null) {
						for (const change of carData.change) {
							changeView.push({
								number: change.number,
								sign: change.sign,
								date: TokyuCarHistoryController.#dateFormat(change.date, requestQuery),
							});
						}
					}

					const searchCarView: TokyuCarHistoryView.SearchCar = {
						number: carData.number,
						sign: carData.sign,
						series: carData.series,
						type: carData.type,
						annual: carData.annual,
						register: TokyuCarHistoryController.#dateFormat(carData.register, requestQuery),
						change: changeView,
						renewal: carData.renewal,
						age: dayjs().diff(dayjs(carData.register), 'y'), // https://day.js.org/docs/en/display/difference
						scrap: carData.scrap,
						transfer: carData.transfer,
					};

					if (searchCarsView.length === 0 || carData.series !== beforeSeries) {
						searchCarsView.push([searchCarView]);
					} else {
						searchCarsView[searchCarsView.length - 1]?.push(searchCarView);
					}

					beforeSeries = carData.series;
				}
			}
		}

		const htmlPath = `${this.#configCommon.html}/${this.#config.view.init}`;

		const structuredData = await HtmlStructuredData.getForJson(htmlPath); // 構造データ

		/* EJS を解釈 */
		const main = await ejs.renderFile(htmlPath, {
			requestQuery: requestQuery,
			validateErrors: validationResult?.array({ onlyFirstError: true }) ?? [],
			carSeries: await dao.getCarSeries(), // 車種情報
			searchCount: searchCarsCount,
			searchCars: searchCarsView, // 検索結果のデータ
		});

		/* レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(structuredData.template.name, {
			pagePathAbsoluteUrl: req.path, // U+002F (/) から始まるパス絶対 URL
			structuredData: structuredData,
			jsonLd: HtmlStructuredData.getJsonLd(structuredData),
			main: main,
		});
	}

	/**
	 * 日付データを表示用に整形する
	 *
	 * @param date - 日付データ
	 * @param requestQuery - URL クエリー情報
	 *
	 * @returns 整形後の日付データ
	 */
	static #dateFormat(date: Date, requestQuery: TokyuCarHistoryRequest.Search): string {
		switch (requestQuery.era) {
			case 'ja':
				/* 和暦 */
				return date.toLocaleDateString('ja-JP-u-ca-japanese', { dateStyle: 'short' }).replaceAll('/', '.');
			default:
		}

		/* 西暦 */
		return dayjs(date).format('YYYY-MM-DD');
	}
}
