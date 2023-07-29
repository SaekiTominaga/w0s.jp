export default class FootnoteUtil {
	/**
	 * 脚注データを取得する
	 *
	 * @param document - <main> 要素
	 *
	 * @returns 脚注データ
	 */
	static getData = (document: Document): Map<number, string | undefined> => {
		const footnoteData = new Map<number, string | undefined>();

		document.querySelectorAll<HTMLTemplateElement>('.astro-footnote-reference').forEach((footnoteReferenceTemplate, index) => {
			const no = index + 1;

			const templateElementClone = footnoteReferenceTemplate.content.cloneNode(true) as DocumentFragment;

			const slotElement = templateElementClone.querySelector('.slot');
			footnoteData.set(no, slotElement?.innerHTML);
			slotElement?.remove();

			const aElement = templateElementClone.querySelector('a');
			if (aElement !== null) {
				aElement.href = `#fn-${no}`;
				aElement.id = `fnref-${no}`;
			}

			const numberElement = templateElementClone.querySelector('.number');
			if (numberElement !== null) {
				numberElement.textContent = String(no);
			}

			footnoteReferenceTemplate.parentNode?.appendChild(templateElementClone);
			footnoteReferenceTemplate.remove();
		});

		return footnoteData;
	};
}
