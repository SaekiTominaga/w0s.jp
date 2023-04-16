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
	 * @param {object} options.sectioning_area - Areas containing sectioning content (article, aside, nav, section)
	 * @param {string} options.class - Table of Contents class name
	 * @param {string} options.label - Table of Contents label (`aria-label` attribute value)
	 */
	async convert(
		options: Readonly<{
			target_element: string;
			sectioning_area: Element;
		}>
	): Promise<void> {
		const targetElementName = options.target_element;
		const sectioningAreaElement = options.sectioning_area;

		const targetElement = this.document.querySelector(targetElementName);
		if (targetElement === null) {
			return;
		}

		const tocData: Map<string, string> = new Map();
		sectioningAreaElement.querySelectorAll('article[id], section[id]').forEach((sectioningElement) => {
			const headingText = sectioningElement.querySelector('h2')?.textContent;
			if (headingText === null || headingText === undefined) {
				return;
			}

			tocData.set(sectioningElement.id, headingText);
		});

		const tocSize = tocData.size;
		if (tocSize <= 1) {
			if (tocSize === 1) {
				this.logger.info('見出しレベル 2 が 1 つのみなので目次は表示しない', tocData);
			}
			targetElement.remove();
			return;
		}

		/* EJS を解釈 */
		const html = await this.renderEjsFile({
			tocData: tocData,
		});

		this.replaceHtml(targetElement, html);
	}
}
