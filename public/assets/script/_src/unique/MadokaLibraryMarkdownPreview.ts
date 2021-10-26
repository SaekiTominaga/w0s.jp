import StringEscapeHtml from '@saekitominaga/string-escape-html';

/**
 * Markdown のプレビュー
 *
 * @example
 * <textarea class="js-markdown" data-preview-for="preview"></textarea>
 * <div id="preview"></div>
 */
export default class {
	#thisElement: HTMLTextAreaElement; // 対象要素

	#previewElement: HTMLElement | null = null; // プレビューを表示する要素
	#beforeLineElements: NodeListOf<HTMLElement> | null = null; // プレビューを表示する要素

	/**
	 * @param {HTMLTextAreaElement} thisElement - 対象要素
	 */
	constructor(thisElement: HTMLTextAreaElement) {
		this.#thisElement = thisElement;
	}

	connected(): void {
		const previewElementId = this.#thisElement.dataset.previewFor;
		if (previewElementId === undefined) {
			throw new Error('Attribute: `data-preview-for` is not set.');
		}

		const previewElement = document.getElementById(previewElementId);
		if (previewElement === null) {
			throw new Error(`Element: #${previewElementId} can not found.`);
		}

		this.#previewElement = previewElement;
		this.#beforeLineElements = <NodeListOf<HTMLElement>>previewElement.childNodes;

		this._preview();
		this.#thisElement.addEventListener('input', () => {
			this._preview();
		});
	}

	/**
	 * プレビューを実施する
	 */
	private _preview(): void {
		const afterLineTextList:string[] = []; // <textarea> に入力されたテキスト内容を一行ずつ格納

		for (const line of this.#thisElement.value.split('\n')) {
			if (line === '') {
				continue;
			}

			afterLineTextList.push(
				StringEscapeHtml.escape(line)
					.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
					.replace(/\[([^[]+?)\]\((https?:\/\/[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+)\)/g, (match, content, url) => {
						try {
							return `<a href="${url}">${content}</a><b class="c-domain">(${new URL(url).host})</b>`;
						} catch (e) {
							console.info(e);
						}
						return match;
					})
			);
		}

		for (let i = 0; i < Math.max(afterLineTextList.length, (<NodeListOf<HTMLElement>>this.#beforeLineElements).length); i++) {
			const afterLineText = afterLineTextList[i];
			const beforeLineElement = (<NodeListOf<HTMLElement>>this.#beforeLineElements)[i];

			if (beforeLineElement === undefined && afterLineText !== undefined) {
				/* 新しい行が入力されたとき */
				const afterLineElement = document.createElement('p');
				afterLineElement.insertAdjacentHTML('beforeend', afterLineText);

				(<HTMLElement>this.#previewElement).appendChild(afterLineElement);
			} else if (afterLineText === undefined) {
				/* 既存の行が削除されたとき */
				(<HTMLElement>this.#previewElement).lastElementChild?.remove();
			} else if (beforeLineElement.innerHTML !== afterLineText) {
				/* 行内のテキストが変更されたとき */
				const afterLineElement = document.createElement('p');
				afterLineElement.insertAdjacentHTML('beforeend', afterLineText);

				(<HTMLElement>this.#previewElement).replaceChild(afterLineElement, beforeLineElement);
			}
		}
	}
}
