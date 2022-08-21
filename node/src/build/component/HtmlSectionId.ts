import GithubSlugger from 'github-slugger';
import Html from './Html.js';

/**
 * セクション ID 自動生成
 */
export default class HtmlSectionId extends Html {
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
			section_area: Element;
			heading_levels: number[];
		}>
	): void {
		const sectionAreaElement = options.section_area;
		const headingSelectors = options.heading_levels.map((level) => `h${level}`).join(','); // Array(3) [1, 2, 3] => "h1,h2,h3"

		const targetElements = sectionAreaElement.querySelectorAll('article, section');
		if (targetElements.length >= 1) {
			const slugger = new GithubSlugger();

			for (const targetElement of targetElements) {
				const headingText = targetElement.querySelector(headingSelectors)?.textContent;
				if (headingText === null || headingText === undefined) {
					continue;
				}

				const nowId = targetElement.id;
				const newId = slugger.slug(nowId !== '' ? nowId : headingText);

				if (nowId === '') {
					targetElement.id = newId;
				}
			}
		}
	}
}
