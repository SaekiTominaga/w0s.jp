import ConsoleLocaleTimestamp from 'console-locale-timestamp';
import fs from 'fs';
import { loadConfig, optimize } from 'svgo';

const consoleTimestamp = new ConsoleLocaleTimestamp();

const filePath = process.argv[2];
const configFilePath = process.argv[3];

(async () => {
	const fileData = (await fs.promises.readFile(filePath)).toString();

	const optimizeOptions = await loadConfig(configFilePath);

	const optimizedResult = optimize(fileData.replace(/<svg version="([0-9.]+)"/, '<svg').replace(' id="レイヤー_1"', ''), optimizeOptions);

	const distPath = `public/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;

	await fs.promises.writeFile(distPath, optimizedResult.data);
	consoleTimestamp.info(`SVG ファイル出力: ${distPath}`);
})();
