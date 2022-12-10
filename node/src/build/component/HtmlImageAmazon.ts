import PaapiItemImageUrlParser from '@saekitominaga/paapi-item-image-url-parser';
import Html from './Html.js';

/**
 * Amazon 商品画像
 *
 * <img src="https://m.media-amazon.com/images/I/XXX._SL160_.jpg" class="build-amazon-image" />
 * ↓
 * <img src="https://m.media-amazon.com/images/I/XXX._SL160_.jpg" srcset="https://m.media-amazon.com/images/I/XXX._SL320_.jpg 2x" />
 */
export default class HtmlAmazonImage extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <img> element to process
	 */
	convert(
		options: Readonly<{
			target_class: string;
		}>
	): void {
		const targetClassName = options.target_class;

		for (const targetElement of this.document.querySelectorAll(`.${targetClassName}`)) {
			Html.removeClassName(targetElement, targetClassName);

			const src = targetElement.getAttribute('src');
			if (src === null) {
				this.logger.warn('No `src` attribute');
				continue;
			}

			let imageUrl: URL;
			try {
				imageUrl = new URL(src);
			} catch {
				this.logger.warn('`src` attribute value is not a valid URL', src);
				continue;
			}

			let imageUrl2x: string;
			try {
				const paapiItemImageUrlParser = new PaapiItemImageUrlParser(imageUrl);
				paapiItemImageUrlParser.setSizeMultiply(2);
				imageUrl2x = paapiItemImageUrlParser.toString();
			} catch (e) {
				this.logger.warn(e, src);
				continue;
			}

			targetElement.setAttribute('srcset', `${imageUrl2x} 2x`);
		}
	}
}
