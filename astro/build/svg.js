import fs from 'node:fs';
import { parseArgs } from 'node:util';
import slash from 'slash';
import { loadConfig, optimize } from 'svgo';

/**
 * SVG ビルド
 */

/* 引数処理 */
const argsParsedValues = parseArgs({
	options: {
		files: {
			type: 'string',
			short: 'f',
			multiple: true,
		},
		config: {
			type: 'string',
			short: 'c',
		},
	},
}).values;

if (argsParsedValues.files === undefined) {
	throw new Error('Argument `files` not specified');
}
if (argsParsedValues.config === undefined) {
	throw new Error('Argument `config` not specified');
}
const filesPath = argsParsedValues.files.map((file) => slash(file));
const configFilePath = slash(argsParsedValues.config);

const config = await loadConfig(configFilePath);

const files = fs.promises.glob(filesPath);

for await (const file of files) {
	/* ファイル読み込み */
	const fileData = (await fs.promises.readFile(file)).toString();

	/* SVG 最適化 */
	const optimized = optimize(fileData.replace(/<svg version="([0-9.]+)"/, '<svg').replace(' id="レイヤー_1"', ''), config);

	/* 出力 */
	await fs.promises.writeFile(file, optimized.data);
	console.info(`SVG file optimized: ${file}`);
}
