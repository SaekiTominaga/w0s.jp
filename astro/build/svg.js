import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { globby } from 'globby';
import slash from 'slash';
import { loadConfig, optimize } from 'svgo';

/**
 * SVG ビルド
 */

/* 引数処理 */
const argsParsedValues = parseArgs({
	options: {
		file: {
			type: 'string',
			short: 'f',
		},
		input: {
			type: 'string',
			short: 'i',
		},
		output: {
			type: 'string',
			short: 'o',
		},
		config: {
			type: 'string',
			short: 'c',
		},
	},
}).values;

if (argsParsedValues.file === undefined) {
	throw new Error('Argument `file` not specified');
}
if (argsParsedValues.input === undefined) {
	throw new Error('Argument `input` not specified');
}
if (argsParsedValues.output === undefined) {
	throw new Error('Argument `output` not specified');
}
if (argsParsedValues.config === undefined) {
	throw new Error('Argument `config` not specified');
}
const filesPath = slash(argsParsedValues.file);
const inputDirectory = slash(argsParsedValues.input);
const outputDirectory = slash(argsParsedValues.output);
const configFilePath = slash(argsParsedValues.config);

const config = await loadConfig(configFilePath);

const fileList = await globby(filesPath);

await Promise.all(
	fileList.map(async (filePath) => {
		/* ファイル読み込み */
		const fileData = (await fs.promises.readFile(filePath)).toString();

		/* SVG 最適化 */
		const svgOptimized = optimize(fileData.replace(/<svg version="([0-9.]+)"/, '<svg').replace(' id="レイヤー_1"', ''), config);

		/* 出力 */
		const distFileParse = path.parse(filePath.replace(new RegExp(`^${inputDirectory}`), outputDirectory));
		const distExtension = distFileParse.dir === outputDirectory && distFileParse.base === 'favicon.svg' ? '.ico' : '.svg'; // favicon.svg → favicon.ico
		const distPath = `${distFileParse.dir}/${distFileParse.name}${distExtension}`;

		try {
			await fs.promises.access(distFileParse.dir);
		} catch {
			await fs.promises.mkdir(distFileParse.dir, { recursive: true });
			console.info(`mkdir: ${distFileParse.dir}`);
		}

		await fs.promises.writeFile(distPath, svgOptimized.data);
		console.info(`SVG file created: ${distPath}`);
	}),
);
