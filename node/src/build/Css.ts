import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { globby } from 'globby';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';

/**
 * CSS 整形
 */
export default class Css extends BuildComponent implements BuildComponentInterface {
	async execute(args: string[]): Promise<void> {
		const filesPath = args.at(0);
		const distDirectory = args.at(1);
		if (filesPath === undefined) {
			throw new Error('Missing parameter');
		}

		const fileList = await globby(filesPath.replace(/\\/g, '/'));

		const prettierOptions: prettier.Options = JSON.parse((await fs.promises.readFile('.prettierrc')).toString());
		prettierOptions.parser = 'css';
		prettierOptions.printWidth = 9999;
		prettierOptions.singleQuote = false;

		fileList.forEach(async (filePath) => {
			/* ファイル読み込み */
			const fileData = (await fs.promises.readFile(filePath)).toString();

			/* 整形 */
			let cssFormatted = fileData;
			try {
				cssFormatted = prettier.format(fileData, prettierOptions);
			} catch (e) {
				this.logger.error(`Prettier error: ${filePath}`, e);
			}

			/* 一時ファイル削除 */
			if (distDirectory !== undefined) {
				await fs.promises.unlink(filePath);
				this.logger.info(`[Prettier] Temp file deleted: ${filePath}`);
			}

			/* 出力 */
			const distPath = distDirectory !== undefined ? `${distDirectory}/${path.basename(filePath)}` : filePath;
			await fs.promises.writeFile(distPath, cssFormatted);
			this.logger.info(`[Prettier] File created: ${distPath}`);
		});
	}
}
