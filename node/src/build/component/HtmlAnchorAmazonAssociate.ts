import Html from './Html.js';

/**
 * Amazon 商品ページのリンクにアソシエイトタグを追加
 */
export default class HtmlAnchorAmazonAssociate extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <a> element to process
	 * @param {string} options.associate_id - Associate ID
	 */
	convert(
		options: Readonly<{
			target_class: string;
			associate_id: string;
		}>
	): void {
		const targetClassName = options.target_class;
		const optionsAssociate = {
			id: options.associate_id,
		};

		for (const targetElement of this.document.querySelectorAll(`.${targetClassName}`)) {
			this.removeClassName(targetElement, targetClassName);

			const href = targetElement.getAttribute('href');
			if (href === null) {
				console.warn('No `href` attribute', targetElement.textContent);
				continue;
			}

			if (!href.match(/^https:\/\/www\.amazon\.[a-z]+(\.[a-z]+)?\/dp\/([\dA-Z]{10})\/$/)) {
				console.warn('URL is not from Amazon product page', targetElement.textContent);
				continue;
			}

			targetElement.setAttribute('href', `${href}ref=nosim?tag=${optionsAssociate.id}`); // https://affiliate-program.amazon.com/help/node/topic/GP38PJ6EUR6PFBEC
		}
	}
}
