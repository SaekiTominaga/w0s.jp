import fs from 'fs';
import { loadConfig, optimize } from 'svgo';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';

/* 設定ファイル読み込み */
const configCommon = <ConfigureCommon>JSON.parse(fs.readFileSync('node/configure/common.json', 'utf8'));

const filePath = process.argv[2];
const configFilePath = process.argv[3];
if (filePath === undefined || configFilePath === undefined) {
	throw new Error('Missing parameter');
}

(async () => {
	const svg = (await fs.promises.readFile(filePath)).toString();

	const svgOptimized = optimize(svg.replace(/<svg version="([0-9.]+)"/, '<svg').replace(' id="レイヤー_1"', ''), await loadConfig(configFilePath));
	if (svgOptimized.error !== undefined) {
		throw new Error(svgOptimized.error);
	}

	/* 出力 */
	const distPath = `${configCommon.static.root}/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;
	await fs.promises.writeFile(distPath, svgOptimized.data);
	console.info(`SVG file created: ${distPath}`);
})();
