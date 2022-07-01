import AkamatsuGeneratorValidator from '../validator/AkamatsuGeneratorValidator.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import fs from 'fs';
import HttpResponse from '../util/HttpResponse.js';
import path from 'path';
import RequestUtil from '../util/RequestUtil.js';
import Sharp from 'sharp';
import StringEscapeHtml from '@saekitominaga/string-escape-html';
import { NoName as Configure } from '../../configure/type/akamatsu-generator';
import { Request, Response } from 'express';
import { Result as ValidationResult, ValidationError } from 'express-validator';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';

/**
 * 赤松健セリフジェネレーター
 */
export default class AkamatsuGenerator extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;
	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/akamatsu-generator.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const requestQuery: AkamatsuGeneratorRequest.Generate = {
			icon: RequestUtil.string(req.body.icon),
			color: RequestUtil.string(req.body.color),
			bgcolor: RequestUtil.string(req.body.bgcolor),
			text_right1: RequestUtil.string(req.body.text_right1),
			text_right2: RequestUtil.string(req.body.text_right2),
			text_left1: RequestUtil.string(req.body.text_left1),
			text_left2: RequestUtil.string(req.body.text_left2),
		};

		const validator = new AkamatsuGeneratorValidator(req, this.#config);
		let validationResult: ValidationResult<ValidationError> | null = null;

		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		let generatedImage: string | undefined;
		const generatedText: string[] = [];
		if (requestQuery.icon !== null) {
			validationResult = await validator.generate();
			if (validationResult.isEmpty()) {
				/* 生成実行 */

				const filePath = path.resolve(`${this.#config.icon.dir}/${requestQuery.icon}`);
				this.logger.debug(filePath);

				if (!fs.existsSync(filePath)) {
					this.logger.error('ファイルが存在しない', filePath);
					httpResponse.send500();
					return;
				}

				/* sharp 設定 */
				Sharp.cache(false);

				const sharp = Sharp(filePath);
				sharp.flatten({ background: requestQuery.bgcolor ?? '#ffffff' });

				const sharpOverlayOptions: Sharp.OverlayOptions[] = [];

				if (requestQuery.text_right1 !== null && requestQuery.text_right1 !== '') {
					const svg = this.#getSvg(requestQuery.text_right1, requestQuery.color);
					this.logger.debug('右セリフ1', svg);

					sharpOverlayOptions.push({
						input: Buffer.from(svg),
						top: Math.round(this.#config.icon.padding),
						left:
							requestQuery.text_right2 !== null && requestQuery.text_right2 !== ''
								? Math.round(this.#config.icon.width - this.#config.icon.font_size - this.#config.icon.padding)
								: Math.round(this.#config.icon.width - this.#config.icon.font_size * (0.5 + this.#config.icon.line_height) - this.#config.icon.padding),
					});

					generatedText.push(requestQuery.text_right1);
				}
				if (requestQuery.text_right2 !== null && requestQuery.text_right2 !== '') {
					const svg = this.#getSvg(requestQuery.text_right2, requestQuery.color);
					this.logger.debug('右セリフ2', svg);

					sharpOverlayOptions.push({
						input: Buffer.from(svg),
						top: Math.round(this.#config.icon.padding),
						left:
							requestQuery.text_right1 !== null && requestQuery.text_right1 !== ''
								? Math.round(this.#config.icon.width - this.#config.icon.font_size * (1 + this.#config.icon.line_height) - this.#config.icon.padding)
								: Math.round(this.#config.icon.width - this.#config.icon.font_size * (0.5 + this.#config.icon.line_height) - this.#config.icon.padding),
					});

					generatedText.push(requestQuery.text_right2);
				}

				if (requestQuery.text_left1 !== null && requestQuery.text_left1 !== '') {
					const svg = this.#getSvg(requestQuery.text_left1, requestQuery.color);
					this.logger.debug('左セリフ1', svg);

					sharpOverlayOptions.push({
						input: Buffer.from(svg),
						top: Math.round(this.#config.icon.padding),
						left:
							requestQuery.text_left2 !== null && requestQuery.text_left2 !== ''
								? Math.round(this.#config.icon.padding + this.#config.icon.font_size * this.#config.icon.line_height)
								: Math.round(this.#config.icon.padding + this.#config.icon.font_size * (-0.5 + this.#config.icon.line_height)),
					});

					generatedText.push(requestQuery.text_left1);
				}
				if (requestQuery.text_left2 !== null && requestQuery.text_left2 !== '') {
					const svg = this.#getSvg(requestQuery.text_left2, requestQuery.color);
					this.logger.debug('左セリフ2', svg);

					sharpOverlayOptions.push({
						input: Buffer.from(svg),
						top: Math.round(this.#config.icon.padding),
						left:
							requestQuery.text_left1 !== null && requestQuery.text_left1 !== ''
								? Math.round(this.#config.icon.padding)
								: Math.round(this.#config.icon.padding) + this.#config.icon.font_size * (-0.5 + this.#config.icon.line_height),
					});

					generatedText.push(requestQuery.text_left2);
				}

				sharp.composite(sharpOverlayOptions);
				generatedImage = (await sharp.toBuffer()).toString('base64');

				this.logger.info('画像生成', generatedText.join(), requestQuery.icon, requestQuery.color, requestQuery.bgcolor);
			}
		}

		/* 初期表示 */
		const icons: Map<string, string> = new Map();
		for (const icon of this.#config.icons) {
			icons.set(icon.filename, icon.caption);
		}

		/* レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(this.#config.view.init, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			validateErrors: validationResult?.array({ onlyFirstError: true }) ?? [],
			icons: icons,
			generatedImage: generatedImage,
			generatedText: generatedText,
		});
	}

	/**
	 * SVG データを取得する
	 *
	 * @param {string} text - セリフ情報
	 * @param {string | null} color - 文字色
	 *
	 * @returns {string} SVG データ
	 */
	#getSvg(text: string, color: string | null): string {
		return `
<svg viewBox="0 0 ${this.#config.icon.width} ${this.#config.icon.height}">
	<text x="${this.#config.icon.font_size / 2}" writing-mode="tb" fill="${StringEscapeHtml.escape(color ?? '#000000')}" font-size="${
			this.#config.icon.font_size
		}">${StringEscapeHtml.escape(text)}</text>
</svg>
`;
	}
}
