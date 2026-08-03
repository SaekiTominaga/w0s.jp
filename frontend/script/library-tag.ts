/**
 * ライブラリー — タグ絞り込み機能
 */
const URL_PARAM_TAG = 'tag'; // URL パラメーター・タグのキー

const $$librarySection = document.querySelectorAll<HTMLElement>('.l-content__body > section');
const $$library = document.querySelectorAll<HTMLElement>('.js-library');
const $$tagButton = document.querySelectorAll<HTMLButtonElement>('.js-library-tag');

/**
 * 絞り込みを行う
 *
 * @param tagName - タグ名
 */
const narrowDown = (tagName?: string): void => {
	/* いったんリセット */
	$$librarySection.forEach((element) => {
		element.hidden = false;
	});
	$$library.forEach((element) => {
		element.hidden = false;
	});
	$$tagButton.forEach((element) => {
		element.setAttribute('aria-pressed', 'false');
	});

	if (tagName !== undefined) {
		/* 当該タグ以外の要素を非表示にする */
		Array.from($$library)
			.filter(($element) => Array.from($element.querySelectorAll('.js-library-tag')).every(($tag) => $tag.textContent.trim() !== tagName))
			.forEach(($element) => {
				$element.hidden = true;
			});

		/* セクション内の表示要素が 0 件になった場合はセクションごと非表示にする */
		Array.from($$librarySection)
			.filter(($element) => $element.querySelectorAll('.js-library:not([hidden])').length === 0)
			.forEach(($element) => {
				$element.hidden = true;
			});

		/* 当該タグボタンの状態を設定する */
		Array.from($$tagButton)
			.filter(($element) => $element.textContent.trim() === tagName)
			.forEach(($element) => {
				$element.setAttribute('aria-pressed', 'true');
			});
	}
};

/**
 * 初期処理
 */
const init = (): void => {
	$$tagButton.forEach(($element) => {
		$element.disabled = false;
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
	const $tagButton = ev.currentTarget as HTMLButtonElement;

	const tagName = $tagButton.textContent.trim();

	const url = new URL(location.toString());

	if ($tagButton.getAttribute('aria-pressed') === 'false') {
		/* タグによる絞り込み実行 */
		url.searchParams.set(URL_PARAM_TAG, tagName);

		narrowDown(tagName);
	} else {
		/* 絞り込み解除 */
		url.searchParams.delete(URL_PARAM_TAG);

		narrowDown();
	}

	/* 押された当該ボタンのあるセクションまでスクロールする */
	$tagButton.closest('.js-library')?.scrollIntoView();

	/* URL の書き換え */
	url.hash = '';
	history.pushState({}, '', url);
};

document.addEventListener('DOMContentLoaded', init, { passive: true });
window.addEventListener('popstate', init, { passive: true });
$$tagButton.forEach(($tagButton): void => {
	$tagButton.addEventListener('click', click, { passive: true });
});
