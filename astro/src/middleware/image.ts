import type { CheerioAPI } from 'cheerio';

/**
 * `<img>` 要素のデフォルト値の属性を削除する
 *
 * @param $ - CheerioAPI
 */
export const removeImageDefaultAttribute = ($: CheerioAPI) => {
	const $images = $('img');
	$images.each((_index, image) => {
		const $image = $(image);
		if ($image.attr('decoding') === 'auto') {
			$image.removeAttr('decoding');
		}
		if ($image.attr('loading') === 'eager') {
			$image.removeAttr('loading');
		}
		if ($image.attr('fetchpriority') === 'auto') {
			$image.removeAttr('fetchpriority');
		}
	});
};
