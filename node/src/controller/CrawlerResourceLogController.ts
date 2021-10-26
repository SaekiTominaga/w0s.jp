import * as Diff from 'diff';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import fs from 'fs';
import { NoName as Configure } from '../../configure/type/crawler-resource';
import { Request, Response } from 'express';

/**
 * ウェブ巡回（リソース・ログ表示）
 */
export default class CrawlerResourceLogController extends Controller implements ControllerInterface {
	#config: Configure;

	/**
	 */
	constructor() {
		super();

		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/crawler-resource.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const requestQuery: CrawlerResourceLogRequest.PageQuery = {
			dir: <string>req.query.dir ?? '',
			diff: <string[]>req.query.diff ?? [],
		};

		let diff: Diff.Change[] = [];
		let fileList: string[] = [];

		const dir = `${this.#config.log_dir}/${requestQuery.dir}`;
		if (fs.existsSync(dir)) {
			/* 差分チェック */
			if (requestQuery.diff.length >= 2) {
				const [file1, file2] = await Promise.all([
					fs.promises.readFile(`${dir}/${requestQuery.diff[0]}`),
					fs.promises.readFile(`${dir}/${requestQuery.diff[1]}`),
				]);

				diff = Diff.diffLines(Buffer.from(file1).toString(), Buffer.from(file2).toString(), { newlineIsToken: true });
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
						} else {
							if (diffPart.count > this.#config.diff.max_line * 2) {
								diffPart.value = lines
									.slice(0, this.#config.diff.max_line)
									.concat(this.#config.diff.omit, lines.slice(lines.length - this.#config.diff.max_line - 1))
									.join('\n');
							}
						}
					}
				});

				this.logger.debug('Diff mode', requestQuery.diff, diff);
			}

			/* 初期表示 */
			fileList = (await fs.promises.readdir(dir)).filter((filePath) => filePath.endsWith('.txt')).reverse();
		}

		/* レンダリング */
		res.render(this.#config.view.log, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			fileList: fileList,
			diff: diff,
		});
	}
}
