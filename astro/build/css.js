import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import prettier from 'prettier';
import slash from 'slash';
import { globby } from 'globby';

/**
 * CSS 整形
 */

/* 引数処理 */
const argsParsedValues = parseArgs({
	options: {
		file: {
			type: 'string',
			short: 'f',
		},
		output: {
			type: 'string',
			short: 'o',
		},
	},
}).values;

const filesPath = slash(argsParsedValues['file']);
const distDirectory = argsParsedValues['output'] !== undefined ? slash(argsParsedValues['output']) : undefined;

const fileList = await globby(filesPath);

await Promise.all(
	fileList.map(async (filePath) => {
		/* ファイル読み込み */
		const fileData = (await fs.promises.readFile(filePath)).toString();

		/* CSS 整形 */
		let cssFormatted = fileData;
		try {
			cssFormatted = await prettier.format(fileData, {
				parser: 'css',
				endOfLine: 'lf',
				printWidth: 9999,
				singleQuote: false,
				useTabs: true,
			});
		} catch (e) {
			console.error(`Prettier error: ${filePath}`, e);
		}

		/* 一時ファイル削除 */
		if (distDirectory !== undefined) {
			await fs.promises.unlink(filePath);
			console.info(`Temp file deleted: ${filePath}`);
		}

		/* 出力 */
		const distPath = distDirectory !== undefined ? `${distDirectory}/${path.basename(filePath)}` : filePath;
		await fs.promises.writeFile(distPath, cssFormatted);
		console.info(`File created: ${distPath}`);
	}),
);
