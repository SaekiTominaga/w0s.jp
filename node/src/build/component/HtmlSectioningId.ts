import GithubSlugger from 'github-slugger';
import Html from './Html.js';

/**
 * セクション ID 自動生成
 */
export default class HtmlSectioningId extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_element - Element name
	 * @param {object} options.sectioning_area - Areas containing Sectioning content (article, aside, nav, section)
	 * @param {string} options.class - Table of Contents class name
	 * @param {string} options.label - Table of Contents label (`aria-label` attribute value)
	 */
	convert(
		options: Readonly<{
			sectioning_area: Element;
			heading_levels: number[];
		}>
	): void {
		const sectioningAreaElement = options.sectioning_area;
		const headingSelectors = options.heading_levels.map((level) => `h${level}`).join(','); // Array(3) [1, 2, 3] => "h1,h2,h3"

		const targetElements = sectioningAreaElement.querySelectorAll('article, section');
		if (targetElements.length >= 1) {
			const slugger = new GithubSlugger();

			targetElements.forEach((targetElement): void => {
				const headingText = targetElement.querySelector(headingSelectors)?.textContent;
				if (headingText === null || headingText === undefined) {
					return;
				}

				const nowId = targetElement.id;
				if (nowId === '') {
					targetElement.id = slugger.slug(nowId !== '' ? nowId : headingText);
				}
			});
		}
	}
}
