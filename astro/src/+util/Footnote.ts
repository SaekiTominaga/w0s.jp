export default class FootnoteUtil {
	/**
	 * 脚注データを取得する
	 *
	 * @param document - <main> 要素
	 *
	 * @returns 脚注データ
	 */
	static getData = (document: Document): { note: Map<number, string | undefined>; reference: Map<number, string | undefined> } => {
		const noteData = new Map<number, string | undefined>();
		const referenceData = new Map<number, string | undefined>();

		document.querySelectorAll<HTMLTemplateElement>('.astro-noteref.-note').forEach((noterefTemplate, index) => {
			const no = index + 1;

			const templateElementClone = noterefTemplate.content.cloneNode(true) as DocumentFragment;

			const id = noterefTemplate.dataset.by;
			if (id === undefined) {
				throw new Error('`data-by` attribute is not set');
			}

			const contentElement = document.getElementById(id);

			noteData.set(no, contentElement?.innerHTML);
			contentElement?.remove();

			const aElement = templateElementClone.querySelector('a');
			if (aElement !== null) {
				aElement.href = `#fn-note${String(no)}`;
				aElement.id = `fnref-note${String(no)}`;
			}

			const numberElement = templateElementClone.querySelector('x-number');
			numberElement?.replaceWith(document.createTextNode(String(no)));

			noterefTemplate.parentNode?.appendChild(templateElementClone);
			noterefTemplate.remove();
		});

		document.querySelectorAll<HTMLTemplateElement>('.astro-noteref.-ref').forEach((noterefTemplate, index) => {
			const no = index + 1;

			const templateElementClone = noterefTemplate.content.cloneNode(true) as DocumentFragment;

			const id = noterefTemplate.dataset.by;
			if (id === undefined) {
				throw new Error('`data-by` attribute is not set');
			}

			const contentElement = document.getElementById(id);

			referenceData.set(no, contentElement?.innerHTML);
			contentElement?.remove();

			const aElement = templateElementClone.querySelector('a');
			if (aElement !== null) {
				aElement.href = `#fn-ref${String(no)}`;
				aElement.id = `fnref-ref${String(no)}`;
			}

			const numberElement = templateElementClone.querySelector('x-number');
			numberElement?.replaceWith(document.createTextNode(String(no)));

			noterefTemplate.parentNode?.appendChild(templateElementClone);
			noterefTemplate.remove();
		});

		return {
			note: noteData,
			reference: referenceData,
		};
	};
}
