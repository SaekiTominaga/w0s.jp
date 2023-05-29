interface BlogNewlyJson {
	id: number;
	title: string;
}

/**
 * 日記の新着情報を取得し、サイドバーに挿入する
 */
export default class SidebarBlogNewly {
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
		const jsonName = (<HTMLMetaElement | null>document.querySelector('meta[name="w0s:blog:newly"]'))?.content;

		/* エンドポイントから JSON ファイルを取得する */
		const entries: BlogNewlyJson[] = await SidebarBlogNewly.#fetch(jsonName);

		/* 取得したデータを HTML ページ内に挿入する */
		this.#insert(entries);

		/* 直近の祖先要素の hidden 状態を解除する */
		const ancestorHiddenElement = this.#templateElement.closest<HTMLElement>('[hidden]');
		if (ancestorHiddenElement !== null) {
			ancestorHiddenElement.hidden = false;
		}
	}

	/**
	 * エンドポイントから JSON ファイルを取得する
	 *
	 * @param {string} jsonName - 取得する JSON の名前
	 *
	 * @returns {object[]} 日記エントリーのデータ
	 */
	static async #fetch(jsonName?: string): Promise<BlogNewlyJson[]> {
		const response = await fetch(`https://blog.w0s.jp/json/newly${jsonName !== undefined ? `_${jsonName}` : ''}.json`);
		if (!response.ok) {
			throw new Error(`"${response.url}" is ${response.status} ${response.statusText}`);
		}

		const json = await response.json();
		return json;
	}

	/**
	 * 日記エントリーのデータを HTML ページ内に挿入する
	 *
	 * @param {object[]} entries - 日記エントリーのデータ
	 */
	#insert(entries: BlogNewlyJson[]): void {
		const fragment = document.createDocumentFragment();

		for (const entry of entries) {
			const templateElementClone = this.#templateElement.content.cloneNode(true);

			const aElement = (<DocumentFragment>templateElementClone).querySelector('a');
			if (aElement !== null) {
				aElement.href = `https://blog.w0s.jp/${String(entry.id)}`;
				aElement.insertAdjacentHTML('afterbegin', entry.title);
			}

			fragment.appendChild(templateElementClone);
		}

		this.#templateElement.parentNode?.appendChild(fragment);
	}
}
