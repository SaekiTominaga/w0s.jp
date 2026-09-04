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

	// oxlint-disable-next-line new-cap
	const purify = DOMPurify(window);

	return [...document.querySelectorAll('section[id]')]
		.map(($section): TocData | undefined => {
			const headingHtml = $section.querySelector('h2')?.innerHTML;
			if (headingHtml === undefined) {
				return undefined;
			}

			const sanitizedHeadingHtml = purify.sanitize(headingHtml, {
				ALLOWED_TAGS: ['small', 'cite', 'code', 'span'],
				ALLOWED_ATTR: ['lang'],
			});
			if (headingHtml !== sanitizedHeadingHtml) {
				throw new Error(`The content of the heading element contains disallowed elements or attributes: \`${headingHtml}\``);
			}

			return {
				id: $section.id,
				headingHtml: sanitizedHeadingHtml,
			};
		})
		.filter((data) => data !== undefined);
};
