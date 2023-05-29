import URLSearchParamsCustomSeparator from '@saekitominaga/urlsearchparams-custom-separator';
import Html from './Html.js';

/**
 * `<picture>` 要素を使って複数フォーマットの画像を提供する
 *
 * <img src="https://media.w0s.jp/thumbimage/foo" class="build-image">
 * ↓
 * <picture>
 *   <source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;quality=80, https://media.w0s.jp/thumbimage/foo?type=avif;quality=40 2x">
 *   <source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;quality=80, https://media.w0s.jp/thumbimage/foo?type=webp;quality=40 2x">
 *   <img src="https://media.w0s.jp/thumbimage/foo">
 * </picture>
 */
export default class HtmlImage extends Html {
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

		this.document.querySelectorAll(`.${targetClassName}`).forEach((targetElement) => {
			Html.removeClassName(targetElement, targetClassName);

			const src = targetElement.getAttribute('src');
			if (src === null) {
				console.warn('No `src` attribute');
				return;
			}

			let url: URL;
			try {
				url = new URL(src);
			} catch {
				console.warn('`src` attribute value is not a valid URL', src);
				return;
			}

			if (url.origin !== 'https://media.w0s.jp') {
				console.warn('`src` attribute value is not a valid `media.w0s.jp` origin', src);
				return;
			}
			if (!url.pathname.startsWith('/thumbimage/')) {
				console.warn('`src` attribute value is not a valid `media.w0s.jp` path', src);
				return;
			}

			const urlSearchParamsCustomSeparator = new URLSearchParamsCustomSeparator(url.toString(), [';']);
			const urlSearchParams = urlSearchParamsCustomSeparator.getURLSearchParamsObject();

			const width = urlSearchParams.get('w') !== null ? Number(urlSearchParams.get('w')) : null;
			const height = urlSearchParams.get('h') !== null ? Number(urlSearchParams.get('h')) : null;
			const quality = urlSearchParams.get('quality') !== null ? Number(urlSearchParams.get('quality')) : 80;

			const originAndPath = `${url.origin}${url.pathname}`;
			const width1x = width;
			const width2x = width !== null ? width * 2 : null;
			const height1x = height;
			const height2x = height !== null ? height * 2 : null;
			const quality1x = quality;
			const quality2x = quality / 2;

			const pictureElement = this.document.createElement('picture');

			const sourceAvifElement = this.document.createElement('source');
			sourceAvifElement.type = 'image/avif';
			sourceAvifElement.srcset = `${originAndPath}${HtmlImage.#assembleUrlSearch(
				'avif',
				width1x,
				height1x,
				quality1x
			)}, ${originAndPath}${HtmlImage.#assembleUrlSearch('avif', width2x, height2x, quality2x)} 2x`;
			pictureElement.appendChild(sourceAvifElement);

			const sourceWebpElement = this.document.createElement('source');
			sourceWebpElement.type = 'image/webp';
			sourceWebpElement.srcset = `${originAndPath}${HtmlImage.#assembleUrlSearch(
				'webp',
				width1x,
				height1x,
				quality1x
			)}, ${originAndPath}${HtmlImage.#assembleUrlSearch('webp', width2x, height2x, quality2x)} 2x`;
			pictureElement.appendChild(sourceWebpElement);

			pictureElement.appendChild(targetElement.cloneNode());

			targetElement.parentNode?.replaceChild(pictureElement, targetElement);
		});
	}

	/**
	 * Assemble Url.search
	 *
	 * @param {string} type - Image type
	 * @param {number} width - Image width
	 * @param {number} height - Image Height
	 * @param {number} quality - Image quality
	 *
	 * @returns {string} URL.search
	 */
	static #assembleUrlSearch = (type: string, width: number | null, height: number | null, quality: number): string => {
		let urlSearch = `?type=${type}`;

		if (width !== null) {
			urlSearch += `;w=${width}`;
		}
		if (height !== null) {
			urlSearch += `;h=${height}`;
		}
		urlSearch += `;quality=${quality}`;

		return urlSearch;
	};
}
