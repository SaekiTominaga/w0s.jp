import fs from 'fs';
import zlib from 'zlib';
import { Request, Response } from 'express';
import AmazonAdsDao from '../../dao/AmazonAdsDao.js';
import Controller from '../../Controller.js';
import ControllerInterface from '../../ControllerInterface.js';
import HttpResponse from '../../util/HttpResponse.js';
import { Amazon as Configure } from '../../../configure/type/amazon-ads.js';
import { W0SJp as ConfigureCommon } from '../../../configure/type/common.js';

/**
 * Amazon 商品広告用 JSON ファイル生成
 */
export default class AmazonAdsJsonController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;

	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = JSON.parse(fs.readFileSync('node/configure/amazon-ads.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		const dao = new AmazonAdsDao(this.#configCommon);

		const categoryMaster = await dao.getCategoryMaster(); // カテゴリー情報

		for (const category of categoryMaster) {
			const fileName = category.json_name;
			const filePath = `${this.#configCommon.static.root}/${this.#config.json.directory}/${fileName}.${this.#config.json.extension}`;
			const brotliFilePath = `${filePath}.br`;

			const ads = await dao.getAdsData(fileName);
			if (ads.size === 0) {
				this.logger.warn(`No data: ${fileName}`);
				continue;
			}

			const jsonData: AmazonAdsView.Json[] = [];
			for (const ad of ads) {
				const jsonColumn: AmazonAdsView.Json = {
					a: ad.asin,
					t: ad.title,
				};

				if (ad.binding !== null) {
					jsonColumn.b = ad.binding;
				}
				if (ad.date !== null) {
					jsonColumn.d = ad.date.getTime();
				}
				if (ad.image_url !== null) {
					jsonColumn.i = ad.image_url;
				}
				if (ad.image_width !== null) {
					jsonColumn.w = ad.image_width;
				}
				if (ad.image_height !== null) {
					jsonColumn.h = ad.image_height;
				}

				jsonData.push(jsonColumn);
			}

			const json = JSON.stringify(jsonData);

			const jsonBrotli = zlib.brotliCompressSync(json, {
				params: {
					[zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
					[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
					[zlib.constants.BROTLI_PARAM_SIZE_HINT]: json.length,
				},
			});

			await Promise.all([fs.promises.writeFile(filePath, json), fs.promises.writeFile(brotliFilePath, jsonBrotli)]);
			this.logger.info('JSON file created', filePath);
			this.logger.info('JSON Brotli file created', brotliFilePath);
		}

		httpResponse.send204();
	}
}
