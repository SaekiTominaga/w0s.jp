/**
 * ライブラリー — タグ絞り込み機能
 */
const URL_PARAM_TAG = 'tag'; // URL パラメーター・タグのキー

const librarySectionElements = document.querySelectorAll<HTMLElement>('.l-content__main > section');
const libraryElements = document.querySelectorAll<HTMLElement>('.p-library');
const tagButtonElements = document.querySelectorAll<HTMLButtonElement>('.js-library-tag');

/**
 * 絞り込みを行う
 *
 * @param tagName - タグ名
 */
const narrowDown = (tagName?: string): void => {
	/* いったんリセット */
	librarySectionElements.forEach((element) => {
		element.hidden = false;
	});
	libraryElements.forEach((element) => {
		element.hidden = false;
	});
	tagButtonElements.forEach((element) => {
		element.setAttribute('aria-pressed', 'false');
	});

	if (tagName !== undefined) {
		/* 当該タグ以外の要素を非表示にする */
		Array.from(libraryElements)
			.filter((element) => Array.from(element.querySelectorAll('.p-library .p-library__tags > li')).every((liElement) => liElement.textContent !== tagName))
			.forEach((element) => {
				element.hidden = true;
			});

		/* セクション内の表示要素が 0 件になった場合はセクションごと非表示にする */
		Array.from(librarySectionElements)
			.filter((element) => element.querySelectorAll('.p-library:not([hidden])').length === 0)
			.forEach((element) => {
				element.hidden = true;
			});

		/* 当該タグボタンの状態を設定する */
		Array.from(tagButtonElements)
			.filter((element) => element.textContent === tagName)
			.forEach((element) => {
				element.setAttribute('aria-pressed', 'true');
			});
	}
};

/**
 * 初期処理
 */
const init = (): void => {
	tagButtonElements.forEach((element) => {
		element.disabled = false;
	});

	const url = new URL(location.toString());

	const tagName = url.searchParams.get(URL_PARAM_TAG);

	narrowDown(tagName ?? undefined);
};

/**
 * ボタン押下時の処理
 *
 * @param ev - イベント
 */
const click = (ev: Event): void => {
	const tagButtonElement = ev.currentTarget as HTMLButtonElement;

	const tagName = tagButtonElement.textContent;
	if (tagName === null) {
		return;
	}

	const url = new URL(location.toString());

	if (tagButtonElement.getAttribute('aria-pressed') === 'false') {
		/* タグによる絞り込み実行 */
		url.searchParams.set(URL_PARAM_TAG, tagName);

		narrowDown(tagName);
	} else {
		/* 絞り込み解除 */
		url.searchParams.delete(URL_PARAM_TAG);

		narrowDown();
	}

	/* 押された当該ボタンのあるセクションまでスクロールする */
	tagButtonElement.closest('.p-library')?.scrollIntoView();

	/* URL の書き換え */
	url.hash = '';
	history.pushState({}, '', url);
};

document.addEventListener('DOMContentLoaded', init, { passive: true });
window.addEventListener('popstate', init, { passive: true });
tagButtonElements.forEach((tagButtonElement): void => {
	tagButtonElement.addEventListener('click', click, { passive: true });
});
