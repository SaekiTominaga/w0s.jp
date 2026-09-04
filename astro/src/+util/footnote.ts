type Data = Map<number, string | undefined>;

const getData = (
	document: Document,
	options: Readonly<{
		selector: string;
		noteRefIdPrefix: string;
		footnoteIdPrefix: string;
	}>,
): Data => {
	const data: Data = new Map();

	document.querySelectorAll<HTMLTemplateElement>(options.selector).forEach(($noterefTemplate, index) => {
		const no = index + 1;

		const $templateClone = $noterefTemplate.content.cloneNode(true) as DocumentFragment;

		const id = $noterefTemplate.dataset['by'];
		if (id === undefined) {
			throw new Error('`data-by` attribute is not set');
		}

		const $content = document.querySelector(`#${id}`);

		data.set(no, $content?.innerHTML);
		$content?.remove();

		const $a = $templateClone.querySelector('a');
		if ($a !== null) {
			$a.href = `#${options.footnoteIdPrefix}${String(no)}`;
			$a.id = `${options.noteRefIdPrefix}${String(no)}`;
		}

		const $number = $templateClone.querySelector('x-number');
		$number?.replaceWith(document.createTextNode(String(no)));

		$noterefTemplate.parentNode?.append($templateClone);
		$noterefTemplate.remove();
	});

	return data;
};

/**
 * 注釈データを取得する
 *
 * @param document - <main> 要素
 *
 * @returns 注釈データ
 */
const getNoteData = (document: Document): Data =>
	getData(document, {
		selector: '.astro-noteref.-note',
		noteRefIdPrefix: 'nr-note',
		footnoteIdPrefix: 'fn-note',
	});

/**
 * 参考文献データを取得する
 *
 * @param document - <main> 要素
 *
 * @returns 参考文献データ
 */
const getReferenceData = (document: Document): Data =>
	getData(document, {
		selector: '.astro-noteref.-ref',
		noteRefIdPrefix: 'nr-ref',
		footnoteIdPrefix: 'fn-ref',
	});

export { getNoteData, getReferenceData };
