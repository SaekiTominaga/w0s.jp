import fs from 'fs';
import { loadConfig, optimize } from 'svgo';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';

/**
 * SVG ビルド
 */
export default class Svg extends BuildComponent implements BuildComponentInterface {
	async execute(args: string[]): Promise<void> {
		const filePath = args.at(0);
		const configFilePath = args.at(1);
		if (filePath === undefined || configFilePath === undefined) {
			throw new Error('Missing parameter');
		}

		const svg = (await fs.promises.readFile(filePath)).toString();

		const svgOptimized = optimize(svg.replace(/<svg version="([0-9.]+)"/, '<svg').replace(' id="レイヤー_1"', ''), await loadConfig(configFilePath));

		/* 出力 */
		const distPath = `${this.configCommon.static.root}/${filePath.substring(filePath.replace(/\\/g, '/').indexOf('/') + 1)}`;
		await fs.promises.writeFile(distPath, svgOptimized.data);
		this.logger.info(`SVG file created: ${distPath}`);
	}
}
