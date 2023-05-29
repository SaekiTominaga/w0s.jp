import fs from 'node:fs';
import slash from 'slash';
import { globby } from 'globby';
import { imageSize } from 'image-size';
import { JSDOM } from 'jsdom';
import BuildComponent from '../BuildComponent.js';
import BuildComponentInterface from '../BuildComponentInterface.js';

/**
 * HTML 中の <img> 要素の width, height 属性値が実際の画像サイズと一致しているかどうかチェックする
 */
export default class HtmlImageSize extends BuildComponent implements BuildComponentInterface {
	async execute(args: string[]): Promise<void> {
		const filesPathOs = args.at(0);
		if (filesPathOs === undefined) {
			throw new Error('Missing parameter');
		}
		const filesPath = slash(filesPathOs);

		const fileList = await globby(filesPath);

		const fetchedHost = new Set<string>();

		fileList.forEach(async (filePath) => {
			/* ファイル読み込み */
			console.info(filePath);
			const fileData = (await fs.promises.readFile(filePath)).toString();

			const { document } = new JSDOM(fileData).window;

			await Promise.all(
				[...document.querySelectorAll<HTMLImageElement>('img[src^="https://"]')].map(async (imageElement) => {
					const imageUrl = new URL(imageElement.src);
					if (imageUrl.host === 'media.w0s.jp') {
						return;
					}

					if (fetchedHost.has(imageUrl.host)) {
						/* 同一ホストへのアクセスは一定間隔を空ける */
						await new Promise((resolve) => {
							setTimeout(resolve, 1000);
						});
					} else {
						fetchedHost.add(imageUrl.host);
					}

					const widthAttributeValue = imageElement.width;
					const heightAttributeValue = imageElement.height;
					if (widthAttributeValue === 0 || heightAttributeValue === 0) {
						console.warn('<img> 要素に width 属性または height 属性が指定されていない', filePath, imageUrl.toString());
						return;
					}

					console.info('fetch', imageUrl.toString());
					let response: Response;
					try {
						response = await fetch(imageUrl);
						if (!response.ok) {
							console.error('Fetch error', imageUrl);
							return;
						}
					} catch (e) {
						console.error(e);
						return;
					}

					const arrayBuffer = await response.arrayBuffer();
					const buffer = Buffer.alloc(arrayBuffer.byteLength);
					const unit8Array = new Uint8Array(arrayBuffer);
					buffer.forEach((_, index) => {
						const v = unit8Array[index];
						if (v !== undefined) {
							buffer[index] = v;
						}
					});

					const size = imageSize(buffer);
					const { width, height } = size;
					if (width === undefined || height === undefined) {
						console.warn('<img> 要素で指定された画像のサイズが取得できない', filePath, imageUrl.toString());
						return;
					}
					if (width !== widthAttributeValue) {
						console.warn(`<img> 要素の width 属性値<${widthAttributeValue}>が実際の値<${width}>と違う`, filePath, imageUrl.toString());
					}
					if (height !== heightAttributeValue) {
						console.warn(`<img> 要素の height 属性値<${heightAttributeValue}>が実際の値<${height}>と違う`, filePath, imageUrl.toString());
					}
				})
			);
		});
	}
}
