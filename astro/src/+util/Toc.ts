export default class TocUtil {
	/**
	 * 目次データを取得する
	 *
	 * @param document - <main> 要素
	 *
	 * @returns 目次データ
	 */
	static getData = (document: Document): Map<string, string> => {
		const tocData = new Map<string, string>();

		document.querySelectorAll('section[id]').forEach((sectioningElement) => {
			const headingText = sectioningElement.querySelector('h2')?.textContent;
			if (headingText === null || headingText === undefined) {
				return;
			}

			tocData.set(sectioningElement.id, headingText.trim());
		});

		return tocData;
	};
}
