import fs from 'fs';
import Log4js from 'log4js';
import { loadConfig, optimize } from 'svgo';
import { W0SJp as ConfigureCommon } from '../../configure/type/common.js';

/* 設定ファイル読み込み */
const configCommon = <ConfigureCommon>JSON.parse(await fs.promises.readFile('node/configure/common.json', 'utf8'));

/* Logger 設定 */
Log4js.configure(configCommon.logger.path);
const logger = Log4js.getLogger();

const filePath = process.argv[2];
const configFilePath = process.argv[3];
if (filePath === undefined || configFilePath === undefined) {
	throw new Error('Missing parameter');
}

const svg = (await fs.promises.readFile(filePath)).toString();

const svgOptimized = optimize(svg.replace(/<svg version="([0-9.]+)"/, '<svg').replace(' id="レイヤー_1"', ''), await loadConfig(configFilePath));

/* 出力 */
const distPath = `${configCommon.static.root}/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;
await fs.promises.writeFile(distPath, svgOptimized.data);
logger.info(`SVG file created: ${distPath}`);
