import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export default class TocUtil {
	/**
	 * 目次データを取得する
	 *
	 * @param document - <main> 要素
	 *
	 * @returns 目次データ
	 */
	static getData = (document: Document): Map<string, string> => {
		const { window } = new JSDOM('');
		// eslint-disable-next-line new-cap
		const purify = DOMPurify(window);

		const tocData = new Map<string, string>();

		document.querySelectorAll('section[id]').forEach((sectioningElement) => {
			const headingHtml = sectioningElement.querySelector('h2')?.innerHTML.trim();
			if (headingHtml === undefined || headingHtml === '') {
				return;
			}

			const sanitizedHeadingHtml = purify.sanitize(headingHtml, {
				ALLOWED_TAGS: ['cite', 'small', 'span'],
				ALLOWED_ATTR: ['lang'],
			});
			if (headingHtml !== sanitizedHeadingHtml) {
				console.warn(`Table of Contents headings sanitized: ${headingHtml} → ${sanitizedHeadingHtml}`);
			}

			tocData.set(sectioningElement.id, sanitizedHeadingHtml);
		});

		return tocData;
	};
}
