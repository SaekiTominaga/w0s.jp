import fs from 'fs';
import { loadConfig, optimize } from 'svgo';

const OUT_DIR = 'public';

const filePath = process.argv[2];
const configFilePath = process.argv[3];
if (filePath === undefined || configFilePath === undefined) {
	throw new Error('Missing parameter');
}

(async () => {
	const fileData = (await fs.promises.readFile(filePath)).toString();

	const optimizeOptions = await loadConfig(configFilePath);

	const optimizedResult = optimize(fileData.replace(/<svg version="([0-9.]+)"/, '<svg').replace(' id="レイヤー_1"', ''), optimizeOptions);
	if (optimizedResult.error !== undefined) {
		throw new Error(optimizedResult.error);
	}

	const distPath = `${OUT_DIR}/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;

	await fs.promises.writeFile(distPath, optimizedResult.data);
	console.info(`SVG ファイル出力: ${distPath}`);
})();
