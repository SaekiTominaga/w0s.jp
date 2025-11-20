import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import slash from 'slash';
import { loadConfig, optimize } from 'svgo';

/**
 * SVG ビルド
 */

/* 引数処理 */
const argsParsedValues = parseArgs({
	options: {
		inDir: {
			type: 'string',
			short: 'i',
		},
		outDir: {
			type: 'string',
			short: 'o',
		},
		config: {
			type: 'string',
			short: 'c',
		},
	},
}).values;

if (argsParsedValues.inDir === undefined) {
	throw new Error('Argument `inDir` not specified');
}
if (argsParsedValues.outDir === undefined) {
	throw new Error('Argument `outDir` not specified');
}
if (argsParsedValues.config === undefined) {
	throw new Error('Argument `config` not specified');
}
const inDirectory = slash(argsParsedValues.inDir);
const outDirectory = slash(argsParsedValues.outDir);
const configFilePath = slash(argsParsedValues.config);

const [targetFiles, svgoConfig] = await Promise.all([Array.fromAsync(fs.promises.glob(`${inDirectory}/**/*.svg`)), loadConfig(configFilePath)]);

await Promise.all(
	targetFiles.map(slash).map(async (filePath) => {
		/* ファイル読み込み */
		const fileData = (await fs.promises.readFile(filePath)).toString();

		/* SVG 最適化 */
		const optimized = optimize(fileData.replace(/<svg version="([0-9.]+)"/v, '<svg').replace(' id="レイヤー_1"', ''), svgoConfig);

		const outFileParsed = path.parse(filePath.replace(new RegExp(`^${inDirectory}`, 'v'), outDirectory));
		const outExtension = outFileParsed.dir === outDirectory && outFileParsed.base === 'favicon.svg' ? '.ico' : '.svg'; // `favicon.svg` のみ `favicon.ico` にリネームする
		const outPath = `${outFileParsed.dir}/${outFileParsed.name}${outExtension}`;

		/* 出力 */
		await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
		await fs.promises.writeFile(outPath, optimized.data);
		console.info(`SVG file optimized: ${outPath}`);
	}),
);
