import Html from './Html.js';

/**
 * Amazon 商品ページのリンクにアソシエイトタグを追加
 *
 * <a href="https://www.amazon.com/dp/B01GRDKGZW/" class="build-amazon">Link</a>
 * ↓
 * <a href="https://www.amazon.com/dp/B01GRDKGZW/ref=nosim?tag=xxx-20">Link</a>
 */
export default class HtmlAnchorAmazonAssociate extends Html {
	/**
	 * 変換実行
	 *
	 * @param options - Options
	 * @param options.target_class - Class name of the <a> element to process
	 * @param options.associate_id - Associate ID
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

		this.document.querySelectorAll(`.${targetClassName}`).forEach((targetElement) => {
			Html.removeClassName(targetElement, targetClassName);

			const href = targetElement.getAttribute('href');
			if (href === null) {
				console.warn('No `href` attribute', targetElement.textContent);
				return;
			}

			if (!href.match(/^https:\/\/www\.amazon\.[a-z]+(\.[a-z]+)?\/dp\/([\dA-Z]{10})\/$/)) {
				console.warn('URL is not from Amazon product page', targetElement.textContent);
				return;
			}

			targetElement.setAttribute('href', `${href}ref=nosim?tag=${optionsAssociate.id}`); // https://affiliate-program.amazon.com/help/node/topic/GP38PJ6EUR6PFBEC
		});
	}
}
