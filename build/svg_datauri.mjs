import ConsoleLocaleTimestamp from 'console-locale-timestamp';
import fs from 'fs';
import path from 'path';
import { loadConfig, optimize } from 'svgo';

const consoleTimestamp = new ConsoleLocaleTimestamp();

const filePath = process.argv[2];
const configFilePath = process.argv[3];

const getDataUrlBase64FilePath = (originFilePath) => {
	const filePathParse = path.parse(originFilePath);
	return `${filePathParse.dir}/${filePathParse.name}.dataurl.base64.txt`;
};
const getDataUrlEncodeFilePath = (originFilePath) => {
	const filePathParse = path.parse(originFilePath);
	return `${filePathParse.dir}/${filePathParse.name}.dataurl.encode.txt`;
};

(async () => {
	const fileData = (await fs.promises.readFile(filePath)).toString();

	const optimizeOptions = await loadConfig(configFilePath);

	const optimizedData = optimize(fileData, optimizeOptions).data;

	const base64Data = Buffer.from(optimizedData).toString('base64');
	const base64Path = getDataUrlBase64FilePath(filePath);

	await fs.promises.writeFile(base64Path, `data:image/svg+xml;base64,${base64Data}`);
	consoleTimestamp.info(`データ URI 用ファイル出力: ${base64Path}`);

	const encodeData = encodeURIComponent(optimizedData);
	const encodePath = getDataUrlEncodeFilePath(filePath);

	await fs.promises.writeFile(encodePath, `data:image/svg+xml,${encodeData}`);
	consoleTimestamp.info(`データ URI 用ファイル出力: ${encodePath}`);
})();
