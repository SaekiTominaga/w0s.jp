import type { HTMLElement } from 'node-html-parser';

/**
 * `<img>` 要素のデフォルト値の属性を削除する
 *
 * @param root - Root element
 */
export const removeImageDefaultAttribute = (root: HTMLElement) => {
	const images = root.querySelectorAll('img');
	images.forEach((image) => {
		if (image.getAttribute('decoding') === 'auto') {
			image.removeAttribute('decoding');
		}
		if (image.getAttribute('loading') === 'eager') {
			image.removeAttribute('loading');
		}
		if (image.getAttribute('fetchpriority') === 'auto') {
			image.removeAttribute('fetchpriority');
		}
	});
};
