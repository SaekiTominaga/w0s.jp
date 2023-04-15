import fs from 'fs';
import slash from 'slash';
import { globby } from 'globby';
import { JSDOM } from 'jsdom';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';

/**
 * HTML ビルド
 */
export default class Html extends BuildComponent implements BuildComponentInterface {
	async execute(args: string[]): Promise<void> {
		const filesPathOs = args.at(0);
		if (filesPathOs === undefined) {
			throw new Error('Missing parameter');
		}
		const filesPath = slash(filesPathOs);

		const fileList = await globby(filesPath);

		fileList.forEach(async (filePath) => {
			/* ファイル読み込み */
			const fileData = (await fs.promises.readFile(filePath)).toString();
			const dom = new JSDOM(fileData);
			const documentEjs = dom.window.document;

			/* HTML から必要なデータを取得 */
			const structuredText = documentEjs.getElementById('page-structured')?.textContent; // 構造データ
			if (structuredText === null || structuredText === undefined) {
				throw new Error('Structured data is not defined');
			}
			const structured = JSON.parse(structuredText);
			if (structured.name === structured.headline) {
				this.logger.debug(filePath);
			}
		});
	}
}
