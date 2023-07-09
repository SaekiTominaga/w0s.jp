import fs from 'node:fs';
import ejs from 'ejs';
import type { Request, Response } from 'express';
import * as Diff from 'diff';
import HtmlStructuredData from '@w0s.jp/util/dist/HtmlStructuredData.js';
import Controller from '../Controller.js';
import type ControllerInterface from '../ControllerInterface.js';
import HttpResponse from '../util/HttpResponse.js';
import RequestUtil from '../util/RequestUtil.js';
import type { NoName as Configure } from '../../../configure/type/crawler-resource.js';
import type { W0SJp as ConfigureCommon } from '../../../configure/type/common.js';

/**
 * ウェブ巡回（リソース・ログ表示）
 */
export default class CrawlerResourceLogController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;

	#config: Configure;

	/**
	 * @param configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = JSON.parse(fs.readFileSync('configure/crawler-resource.json', 'utf8'));
	}

	/**
	 * @param req - Request
	 * @param res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const requestQuery: CrawlerResourceRequest.Log = {
			dir: RequestUtil.string(req.query['dir']),
			diff: RequestUtil.strings(req.query['diff']),
		};

		if (!fs.existsSync(this.#config.log_dir)) {
			this.logger.error('ログファイル格納ディレクトリが存在しない', this.#config.log_dir);
			const httpResponse = new HttpResponse(req, res, this.#configCommon);
			httpResponse.send500();
			return;
		}

		let diff: Diff.Change[] = [];
		let fileList: string[] = [];

		if (requestQuery.dir !== null) {
			const dir = `${this.#config.log_dir}/${requestQuery.dir}`;
			if (fs.existsSync(dir)) {
				/* 差分チェック */
				if (requestQuery.diff.length >= 2) {
					const [file1, file2] = await Promise.all([
						fs.promises.readFile(`${dir}/${requestQuery.diff[0]}`),
						fs.promises.readFile(`${dir}/${requestQuery.diff[1]}`),
					]);

					diff = Diff.diffLines(Buffer.from(file2).toString(), Buffer.from(file1).toString(), { newlineIsToken: true });
					diff.forEach((diffPart, index) => {
						if (diffPart.count !== undefined && diffPart.count > this.#config.diff.max_line && !diffPart.added && !diffPart.removed) {
							const lines = diffPart.value.split('\n');

							if (index === 0) {
								diffPart.value = lines
									.slice(lines.length - this.#config.diff.max_line + 1)
									.concat(this.#config.diff.omit)
									.join('\n');
							} else if (index === diff.length - 1) {
								diffPart.value = [this.#config.diff.omit].concat(lines.slice(0, this.#config.diff.max_line)).join('\n');
							} else if (diffPart.count > this.#config.diff.max_line * 2) {
								diffPart.value = lines
									.slice(0, this.#config.diff.max_line)
									.concat(this.#config.diff.omit, lines.slice(lines.length - this.#config.diff.max_line - 1))
									.join('\n');
							}
						}
					});

					this.logger.debug('Diff mode', requestQuery.diff, diff);
				}

				/* 初期表示 */
				fileList = (await fs.promises.readdir(dir)).filter((filePath) => filePath.endsWith('.txt')).reverse();
			}
		}

		const htmlPath = `${this.#configCommon.html}/${this.#config.view.log}`;

		const structuredData = await HtmlStructuredData.getForJson(htmlPath); // 構造データ

		/* EJS を解釈 */
		const main = await ejs.renderFile(htmlPath, {
			requestQuery: requestQuery,
			fileList: fileList,
			diff: diff,
		});

		/* レンダリング */
		res.setHeader('Content-Security-Policy', this.#configCommon.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', this.#configCommon.response.header.cspro_html);
		res.render(structuredData.template.name, {
			pagePathAbsoluteUrl: req.path, // U+002F (/) から始まるパス絶対 URL
			structuredData: structuredData,
			main: main,
		});
	}
}
