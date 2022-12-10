import Html from './Html.js';

/**
 * コンテンツヘッダーのローカルナビをコンテンツフッターにコピーする
 */
export default class HtmlLocalnav extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name
	 * @param {object} options.header_area - Contents header area
	 * @param {object} options.footer_area - Contents footer area
	 */
	convert(
		options: Readonly<{
			target_class: string;
			header_area: Element;
			footer_area: Element | null;
		}>
	): void {
		const targetClassName = options.target_class;
		const headerAreaElement = options.header_area;
		const footerAreaElement = options.footer_area;

		const localNavHeader = headerAreaElement.querySelector(`.${targetClassName}`);
		if (localNavHeader !== null) {
			Html.removeClassName(localNavHeader, targetClassName);

			if (footerAreaElement === null) {
				this.logger.warn('コンテンツフッターが存在しない');
				return;
			}

			const localNavFooter = <Element>localNavHeader.cloneNode(true);
			if (localNavFooter.hasAttribute('id')) {
				localNavFooter.removeAttribute('id');
			}
			footerAreaElement.insertAdjacentElement('beforeend', localNavFooter);
		}
	}
}
