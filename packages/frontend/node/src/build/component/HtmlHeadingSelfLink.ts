import Html from './Html.js';

/**
 * 見出しにセルフリンクを挿入
 *
 * <section id="section-1" class="build-heading-self-link">
 *   <h2>Heading</h2>
 * </section>
 * ↓
 * <section id="section-1">
 *   <h2>Heading<a href="#section-1">§</a></h2>
 * </section>
 */
export default class HtmlHeadingSelfLink extends Html {
	/**
	 * 変換実行
	 *
	 * @param options - Options
	 * @param options.target_class - Class name of the sectioning content (article, aside, nav, section) to process
	 * @param options.insert_position - Link insertion position
	 */
	async convert(
		options: Readonly<{
			target_class: string;
			insert_position: InsertPosition;
		}>
	): Promise<void> {
		const targetClassName = options.target_class;
		const optionsAnchor = {
			insert_position: options.insert_position,
		};

		await Promise.all(
			[...this.document.querySelectorAll(`.${targetClassName}`)].map(async (targetElement) => {
				Html.removeClassName(targetElement, targetClassName);

				const { id } = targetElement;
				if (id === '') {
					console.warn(`<${targetElement.tagName.toLowerCase()}> 要素に ID が設定されていない`, targetElement.textContent?.substring(0, 10));
					return;
				}

				const headingElement = targetElement.querySelector('h1, h2, h3, h4, h5, h6');
				if (headingElement === null) {
					console.warn(`<${targetElement.tagName.toLowerCase()}> 要素に見出しが存在しない`, targetElement.textContent?.substring(0, 10));
					return;
				}

				/* EJS を解釈 */
				const html = await this.renderEjsFile({
					id: id,
				});
				headingElement.insertAdjacentHTML(optionsAnchor.insert_position, html);
			})
		);
	}
}
