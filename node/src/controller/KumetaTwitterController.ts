import fs from 'fs';
import { Request, Response } from 'express';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import KumetaTwitterDao from '../dao/KumetaTwitterDao.js';
import HtmlStructuredData from '../util/HtmlStructuredData.js';
import { Twitter as Configure } from '../../configure/type/kumeta-twitter.js';
import { W0SJp as ConfigureCommon } from '../../configure/type/common.js';

/**
 * 久米田康治・Twitter
 */
export default class KumetaTwitterController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;

	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = JSON.parse(fs.readFileSync('node/configure/kumeta-twitter.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const targetId = this.#config.id;

		const dao = new KumetaTwitterDao(this.#configCommon);

		/* アカウント情報 */
		const accountData = await dao.getAccountData(targetId);

		/* アイコン履歴情報 */
		const profileImages = await dao.getProfileImages(targetId);

		/* バナー履歴情報 */
		// const banners = await dao.getBanners(targetId);

		const structuredData = await HtmlStructuredData.getForJson(`${this.#configCommon.views}/${this.#config.view.init}`); // 構造データ

		/* レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(this.#config.view.init, {
			pagePathAbsoluteUrl: req.path, // U+002F (/) から始まるパス絶対 URL
			structuredData: structuredData,
			jsonLd: HtmlStructuredData.getJsonLd(structuredData),
			accountData: accountData, // アカウント情報
			profileImages: profileImages.some((profileImage) => profileImage.file_name !== null) ? profileImages : null, // アイコン履歴
			// banners: banners.some((banner) => banner.file_name !== null) ? banners : null, // バナー履歴情報
		});
	}
}
