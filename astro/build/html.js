import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { glob } from 'glob';
import slash from 'slash';

/**
 * HTML ビルド後調整
 */

/* 引数処理 */
const argsParsedValues = parseArgs({
	options: {
		directory: {
			type: 'string',
			short: 'd',
		},
	},
}).values;

if (argsParsedValues.directory === undefined) {
	throw new Error('Argument `directory` not specified');
}
const directory = slash(argsParsedValues.directory);

const fileList = await glob(`${directory}/**/*.html`);

/**
 * `build: { format: 'file' }` の設定では `dir/index.astro` が `dir.html` に出力されてしまうので、`dir/index.html` にリネームする
 *
 * @param {string} filePath - ファイルパス
 */
const rename = async (filePath) => {
	const parsed = path.parse(filePath);
	const dir = parsed.dir === '/' ? '' : parsed.dir;

	const naturallyDirectory = `${dir}/${parsed.name}`;

	try {
		await fs.promises.access(`${naturallyDirectory}/`);
	} catch {
		return;
	}

	const newPath = `${naturallyDirectory}/index.html`;
	await fs.promises.rename(filePath, newPath);
	console.info(`File renamed: ${newPath}`);
};

await Promise.all(
	fileList.map(async (filePath) => {
		await rename(filePath);
	}),
);
