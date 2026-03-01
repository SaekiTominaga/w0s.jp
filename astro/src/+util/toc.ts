import DOMPurify from 'dompurify';
import type { DOMWindow } from 'jsdom';

export interface TocData {
	id: string;
	headingHtml: string;
}

/**
 * 目次データを取得する
 *
 * @param window - DOMWindow
 *
 * @returns 目次データ
 */
export const getData = (window: DOMWindow): TocData[] => {
	const { document } = window;

	// eslint-disable-next-line new-cap
	const purify = DOMPurify(window);

	return Array.from(document.querySelectorAll('section[id]'))
		.map((sectioningElement): TocData | undefined => {
			const headingHtml = sectioningElement.querySelector('h2')?.innerHTML;
			if (headingHtml === undefined) {
				return undefined;
			}

			const sanitizedHeadingHtml = purify.sanitize(headingHtml, {
				ALLOWED_TAGS: ['small', 'cite', 'code', 'span'],
				ALLOWED_ATTR: ['lang'],
			});
			if (headingHtml !== sanitizedHeadingHtml) {
				console.warn(`Table of Contents headings sanitized: ${headingHtml} → ${sanitizedHeadingHtml}`);
			}

			return {
				id: sectioningElement.id,
				headingHtml: sanitizedHeadingHtml,
			};
		})
		.filter((data) => data !== undefined);
};
