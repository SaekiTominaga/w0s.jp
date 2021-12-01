import AmazonAdsDao from '../dao/AmazonAdsDao.js';
import AmazonAdsValidator from '../validator/AmazonAdsValidator.js';
// @ts-expect-error: ts(7016)
import amazonPaapi from 'amazon-paapi';
import HttpBasicAuth, { Credentials as HttpBasicAuthCredentials } from '../util/HttpBasicAuth.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import dayjs from 'dayjs';
import fetch from 'node-fetch';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import PaapiItemImageUrlParser from '@saekitominaga/paapi-item-image-url-parser';
import PaapiUtil from '../util/Paapi.js';
import { Amazon as Configure } from '../../configure/type/amazon-ads';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';
import { GetItemsResponse } from 'paapi5-typescript-sdk';
import { Request, Response } from 'express';
import { Result as ValidationResult, ValidationError } from 'express-validator';

/**
 * Amazon 商品広告管理
 */
export default class AmazonAdsController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;
	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/amazon-ads.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		/* Basic 認証 */
		const httpBasicCredentials = new HttpBasicAuth(req).getCredentials();
		if (httpBasicCredentials === null) {
			this.logger.error('Basic 認証の認証情報が取得できない');
			httpResponse.send500();
			return;
		}

		const requestQuery: AmazonAdsRequest.InputQuery = {
			asin: req.body.asin ?? null,
			category: req.body.category ?? null,
			action_add: Boolean(req.body.actionadd),
			action_delete: Boolean(req.body.actiondel),
		};

		const validator = new AmazonAdsValidator(req, this.#config);
		let validationResult: ValidationResult<ValidationError> | null = null;

		const dao = new AmazonAdsDao(this.#configCommon);

		if (requestQuery.action_add) {
			/* 登録 */
			validationResult = await validator.add();
			if (validationResult.isEmpty()) {
				const asin = <string>requestQuery.asin;

				this.logger.info('PA-API 接続（GetItems.ItemIds）', asin);

				const paapiResponse: GetItemsResponse = await amazonPaapi.GetItems(
					{
						PartnerTag: this.#configCommon.paapi.request.partner_tag,
						PartnerType: 'Associates',
						AccessKey: this.#configCommon.paapi.request.access_key,
						SecretKey: this.#configCommon.paapi.request.secret_key,
						Marketplace: this.#configCommon.paapi.request.marketplace,
						Host: this.#configCommon.paapi.request.host,
						Region: this.#configCommon.paapi.request.region,
					},
					{
						ItemIds: [asin],
						Resources: ['Images.Primary.Large', 'ItemInfo.Classifications', 'ItemInfo.ContentInfo', 'ItemInfo.Title'],
					}
				);

				const paapiResponseErrors = paapiResponse.Errors;
				if (paapiResponseErrors !== undefined) {
					for (const error of paapiResponseErrors) {
						this.logger.error(`${error.Code} : ${error.Message}`);
					}

					throw new Error('PA-API Error');
				}

				const item = paapiResponse.ItemsResult.Items[0];
				if (item === undefined) {
					throw new Error('PA-API Error');
				}
				this.logger.debug(item);

				const apiDpUrl = item.DetailPageURL; // 詳細ページURL
				const apiTitle = item.ItemInfo?.Title?.DisplayValue ?? ''; // 製品タイトル // TODO: API 的には null の可能性があるが、 DB のカラムは NOT NULL
				const apiBinding = item.ItemInfo?.Classifications?.Binding?.DisplayValue ?? null; // 製品カテゴリ
				const apiPublicationDateStr = item.ItemInfo?.ContentInfo?.PublicationDate?.DisplayValue ?? null; // 製品公開日
				let apiPublicationDate: Date | null = null;
				if (apiPublicationDateStr !== null) {
					try {
						apiPublicationDate = PaapiUtil.date(apiPublicationDateStr);
					} catch (e) {
						this.logger.error(e);
					}
				}
				const apiImageUrl = item.Images?.Primary?.Large?.URL ?? null; // 画像URL

				await dao.delete(asin);
				await dao.insert(asin, apiDpUrl, apiTitle, apiBinding, apiPublicationDate, apiImageUrl, <string[]>requestQuery.category);

				await this.createJson(req, dao, httpBasicCredentials);

				httpResponse.send303(); // 初期画面に遷移
				return;
			}
		} else if (requestQuery.action_delete) {
			/* 削除 */
			if (requestQuery.asin === null) {
				this.logger.warn('データ削除時に ASIN が指定されていない');
				httpResponse.send403();
				return;
			}

			await dao.delete(requestQuery.asin);

			await this.createJson(req, dao, httpBasicCredentials);

			httpResponse.send303(); // 初期画面に遷移
			return;
		}

		/* 初期表示 */
		const categoryMaster = await dao.getCategoryMaster(); // カテゴリー情報
		const dpList = await dao.getDpList(); // 商品情報

		const dpListView: Map<string, AmazonAdsView.Dp[]> = new Map();
		for (const dp of dpList) {
			const categoryName = dp.category_name;

			let imageUrl: string | null = null;
			let imageUrl2x: string | null = null;
			if (dp.image_url !== null) {
				const paapiItemImageUrlParser = new PaapiItemImageUrlParser(new URL(dp.image_url));
				paapiItemImageUrlParser.setSize(160);
				imageUrl = paapiItemImageUrlParser.toString();

				paapiItemImageUrlParser.setSizeMultiply(2);
				imageUrl2x = paapiItemImageUrlParser.toString();
			}

			const dpListOfCategoryView = dpListView.get(categoryName) ?? [];
			dpListOfCategoryView.push({
				asin: dp.asin,
				url: dp.url,
				title: dp.title,
				binding: dp.binding,
				date: dp.date !== null ? dayjs(dp.date) : null,
				image_url: imageUrl,
				image_url_2x: imageUrl2x,
			});

			dpListView.set(categoryName, dpListOfCategoryView);
		}

		/* レンダリング */
		res.render(this.#config.view.init, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			validateErrors: validationResult?.array({ onlyFirstError: true }) ?? [],
			categoryMaster: categoryMaster, // カテゴリー情報
			dpList: dpListView, // 商品情報
		});
	}

	/**
	 * JSON ファイルを出力する
	 *
	 * @param {Request} req - Request
	 * @param {AmazonAdsDao} dao - Dao
	 * @param {HttpBasicAuthCredentials} httpBasicCredentials - Basic 認証の資格情報
	 */
	private async createJson(req: Request, dao: AmazonAdsDao, httpBasicCredentials: HttpBasicAuthCredentials): Promise<void> {
		const urlBase = req.hostname === 'localhost' ? this.#config.json_create.url_base_dev : this.#config.json_create.url_base;

		for (const jsonPath of await dao.getJsonPaths()) {
			const url = `${urlBase}/${jsonPath}`;
			this.logger.info('Fetch', url);

			const response = await fetch(url, {
				method: 'PUT',
				headers: {
					Authorization: `Basic ${Buffer.from(`${httpBasicCredentials.username}:${httpBasicCredentials.password}`).toString('base64')}`,
				},
			});
			if (!response.ok) {
				this.logger.error('Fetch error', url);
			}
		}
	}
}
