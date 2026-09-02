interface BlogNewlyJson {
	id: number;
	title: string;
}

/**
 * 日記の新着情報を取得し、サイドバーに挿入する
 *
 * @param $template - 挿入するページに存在する <tempalte> 要素
 */
export const blogNewly = async ($template: HTMLElement | undefined | null): Promise<void> => {
	if ($template === null || $template === undefined) {
		return;
	} else if (!($template instanceof HTMLTemplateElement)) {
		throw new TypeError(`\`${$template.tagName.toLowerCase()}#${$template.id}\` is not HTMLTemplateElement`);
	}

	const $preload = document.querySelector('#blog-newly-json');
	if ($preload === null) {
		return;
	} else if (!($preload instanceof HTMLLinkElement)) {
		throw new TypeError(`\`${$preload.tagName.toLowerCase()}#${$preload.id}\` is not HTMLLinkElement`);
	}

	const endpoint = $preload.href;

	/* エンドポイントから JSON ファイルを取得する */
	const response = await fetch(endpoint);
	if (!response.ok) {
		throw new Error(`\`${response.url}\` is ${String(response.status)} ${response.statusText}`);
	}

	const entries = (await response.json()) as readonly Readonly<BlogNewlyJson>[];

	/* 取得したデータを HTML ページ内に挿入する */
	const $fragment = document.createDocumentFragment();

	entries.forEach((entry) => {
		const $templateClone = $template.content.cloneNode(true) as DocumentFragment;

		const $a = $templateClone.querySelector('a');
		if ($a !== null) {
			$a.href = `https://blog.w0s.jp/entry/${String(entry.id)}`;
			$a.insertAdjacentHTML('afterbegin', entry.title);
		}

		$fragment.append($templateClone);
	});

	$template.parentNode?.append($fragment);

	/* 直近の祖先要素の hidden 状態を解除する */
	const $ancestorHidden = $template.closest<HTMLElement>('[hidden]');
	if ($ancestorHidden !== null) {
		$ancestorHidden.hidden = false;
	}
};
