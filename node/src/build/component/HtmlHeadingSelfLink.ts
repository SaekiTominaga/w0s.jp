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
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the sectioning content (article, aside, nav, section) to process
	 * @param {string} options.insert_position - Link insertion position
	 * @param {string} options.anchor_wrap_class - Class name of the wrapping element for the `<a>` element
	 * @param {string} options.anchor_class - Class name of the `<a>` element
	 */
	convert(
		options: Readonly<{
			target_class: string;
			insert_position: InsertPosition;
			anchor_wrap_class?: string;
			anchor_class?: string;
		}>
	): void {
		const targetClassName = options.target_class;
		const optionsAnchor = {
			insert_position: options.insert_position,
			anchor_wrap_class: options.anchor_wrap_class,
			anchor_class: options.anchor_class,
		};

		for (const targetElement of this.document.querySelectorAll(`.${targetClassName}`)) {
			this.removeClassName(targetElement, targetClassName);

			const id = targetElement.id;
			if (id === '') {
				console.warn(`<${targetElement.tagName}> 要素に ID が設定されていない`, targetElement.textContent?.substring(0, 10));
				continue;
			}

			const headingElement = targetElement.querySelector('h1, h2, h3, h4, h5, h6');
			if (headingElement === null) {
				console.warn(`<${targetElement.tagName}> 要素に見出しが存在しない`, targetElement.textContent?.substring(0, 10));
				continue;
			}

			const anchorWrapElement = this.document.createElement('p');
			if (optionsAnchor.anchor_wrap_class !== undefined) {
				anchorWrapElement.className = optionsAnchor.anchor_wrap_class;
			}

			const anchorElement = this.document.createElement('a');
			anchorElement.href = `#${encodeURIComponent(id)}`;
			if (optionsAnchor.anchor_class !== undefined) {
				anchorElement.className = optionsAnchor.anchor_class;
			}
			anchorElement.textContent = '§';
			anchorWrapElement.appendChild(anchorElement);

			headingElement.insertAdjacentElement(optionsAnchor.insert_position, anchorWrapElement);
		}
	}
}
