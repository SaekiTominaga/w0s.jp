interface BlogNewlyJson {
	id: number;
	title: string;
}

/**
 * 日記の新着情報を取得し、サイドバーに挿入する
 */
export default class {
	#templateElement: HTMLTemplateElement;

	/**
	 * @param {object} templateElement - 挿入するページに存在する <tempalte> 要素
	 */
	constructor(templateElement: HTMLTemplateElement) {
		this.#templateElement = templateElement;
	}

	/**
	 * 初期処理
	 */
	async init(): Promise<void> {
		/* エンドポイントから JSON ファイルを取得する */
		const dataList: BlogNewlyJson[] = await this._fetch();

		/* 取得したデータを HTML ページ内に挿入する */
		this._insert(dataList);

		/* 直近の祖先要素の hidden 状態を解除する */
		const ancestorHiddenElement = <HTMLElement | null>this.#templateElement.closest('[hidden]');
		if (ancestorHiddenElement !== null) {
			ancestorHiddenElement.hidden = false;
		}
	}

	/**
	 * エンドポイントから JSON ファイルを取得する
	 *
	 * @returns {object[]} 日記エントリーのデータ
	 */
	private async _fetch(): Promise<BlogNewlyJson[]> {
		const response = await fetch('https://data.w0s.jp/blog/newly.json');
		if (!response.ok) {
			throw new Error(`"${response.url}" is ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * 日記エントリーのデータを HTML ページ内に挿入する
	 *
	 * @param {object[]} entryList - 日記エントリーのデータ
	 */
	private _insert(entryList: BlogNewlyJson[]): void {
		const fragment = document.createDocumentFragment();

		for (const entry of entryList) {
			const templateElementClone = <DocumentFragment>this.#templateElement.content.cloneNode(true);

			const aElement = <HTMLAnchorElement>templateElementClone.querySelector('a');
			aElement.href = `https://blog.w0s.jp/${String(entry.id)}`;
			aElement.textContent = entry.title;

			fragment.appendChild(templateElementClone);
		}

		this.#templateElement.parentNode?.appendChild(fragment);
	}
}
