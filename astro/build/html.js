import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import slash from 'slash';
import { globby } from 'globby';

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
const filesPath = `${slash(argsParsedValues.directory)}/**/*.html`;

const fileList = await globby(filesPath);

/**
 * `<meta charset="utf-8">` は本番環境では不要
 *
 * @param {string} filePath - ファイルパス
 */
const removeMetaCharset = async (filePath) => {
	const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });

	const replaced = data.replace('<meta charset="utf-8">', '');

	await fs.promises.writeFile(filePath, replaced);
	console.info(`Removed \`<meta charset>\`: ${filePath}`);
};

/**
 * `build: { format: 'file' }` の設定では `dir/index.astro` が `dir.html` に出力されてしまうので、`dir/index.html` にリネームする
 *
 * @param {string} filePath - ファイルパス
 */
const rename = async (filePath) => {
	const parsed = path.parse(filePath);

	const directory = `${parsed.dir}/${parsed.name}`;

	try {
		await fs.promises.access(directory);
	} catch {
		return;
	}

	const newPath = `${directory}/index.html`;
	fs.promises.rename(filePath, newPath);
	console.info(`File renamed: ${newPath}`);
};

await Promise.all(
	fileList.map(async (filePath) => {
		await removeMetaCharset(filePath);
		await rename(filePath);
	}),
);
