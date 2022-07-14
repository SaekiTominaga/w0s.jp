import Html from './Html.js';

/**
 * 目次自動生成
 *
 * <build-toc></build-toc>
 * ↓
 * <ol class="p-toc" aria-label="目次">
 *   <li><a href="#">h2 見出し</a></li>
 *   <li><a href="#">h2 見出し</a></li>
 * </ol>
 */
export default class HtmlToc extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_element - Element name
	 * @param {Element} options.section_area - Areas containing `<article>` and `<section>`
	 * @param {string} options.class - Table of Contents class name
	 * @param {string} options.label - Table of Contents label (`aria-label` attribute value)
	 */
	convert(
		options: Readonly<{
			target_element: string;
			section_area: Element;
			class?: string;
			label?: string;
		}>
	): void {
		const targetElementName = options.target_element;
		const sectionAreaElement = options.section_area;
		const optionsToc = {
			class: options.class,
			label: options.label,
		};

		/* 目次自動生成 */
		const targetElements = this.document.querySelectorAll(targetElementName);
		if (targetElements.length >= 1) {
			const tocData: Map<string, string> = new Map();
			for (const sectionElement of sectionAreaElement.querySelectorAll('article[id], section[id]')) {
				const headingText = sectionElement.querySelector('h2')?.textContent;
				if (headingText === null || headingText === undefined) {
					continue;
				}

				tocData.set(sectionElement.id, headingText);
			}

			if (tocData.size >= 2) {
				for (const targetElement of targetElements) {
					const tocElement = this.replaceElement(targetElement, 'ol');
					if (optionsToc.class !== undefined) {
						tocElement.className = optionsToc.class;
					}
					if (optionsToc.label !== undefined) {
						tocElement.setAttribute('aria-label', optionsToc.label);
					}

					for (const [id, str] of tocData) {
						const aElement = this.document.createElement('a');
						aElement.href = `#${encodeURIComponent(id)}`;
						aElement.textContent = str;

						const liElement = this.document.createElement('li');
						liElement.appendChild(aElement);

						tocElement.appendChild(liElement);
					}
				}
			} else {
				console.info('見出しレベル 2 が 1 つのみなので目次は表示しない', tocData);
				for (const targetElement of targetElements) {
					targetElement.remove();
				}
			}
		}
	}
}
