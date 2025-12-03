interface BlogNewlyJson {
	id: number;
	title: string;
}

/**
 * 日記の新着情報を取得し、サイドバーに挿入する
 *
 * @param templateElement - 挿入するページに存在する <tempalte> 要素
 */
export const blogNewly = async (templateElement: HTMLElement | undefined | null): Promise<void> => {
	if (templateElement === null || templateElement === undefined) {
		return;
	} else if (!(templateElement instanceof HTMLTemplateElement)) {
		throw new TypeError(`\`${templateElement.tagName.toLowerCase()}#${templateElement.id}\` is not HTMLTemplateElement`);
	}

	const preloadElement = document.getElementById('blog-newly-json');
	if (preloadElement === null) {
		return;
	} else if (!(preloadElement instanceof HTMLLinkElement)) {
		throw new TypeError(`\`${preloadElement.tagName.toLowerCase()}#${preloadElement.id}\` is not HTMLLinkElement`);
	}

	const endpoint = preloadElement.href;

	/* エンドポイントから JSON ファイルを取得する */
	const response = await fetch(endpoint);
	if (!response.ok) {
		throw new Error(`\`${response.url}\` is ${String(response.status)} ${response.statusText}`);
	}

	const entries = (await response.json()) as readonly Readonly<BlogNewlyJson>[];

	/* 取得したデータを HTML ページ内に挿入する */
	const fragment = document.createDocumentFragment();

	entries.forEach((entry) => {
		const templateElementClone = templateElement.content.cloneNode(true) as DocumentFragment;

		const aElement = templateElementClone.querySelector('a');
		if (aElement !== null) {
			aElement.href = `https://blog.w0s.jp/entry/${String(entry.id)}`;
			aElement.insertAdjacentHTML('afterbegin', entry.title);
		}

		fragment.appendChild(templateElementClone);
	});

	templateElement.parentNode?.appendChild(fragment);

	/* 直近の祖先要素の hidden 状態を解除する */
	const ancestorHiddenElement = templateElement.closest<HTMLElement>('[hidden]');
	if (ancestorHiddenElement !== null) {
		ancestorHiddenElement.hidden = false;
	}
};
