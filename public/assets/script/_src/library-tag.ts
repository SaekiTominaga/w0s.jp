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
 * @param {string} tagName - タグ名
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
		element.disabled = false;
	});

	if (tagName !== undefined) {
		/* 当該タグ以外の要素を非表示にする */
		Array.from(libraryElements)
			.filter((element) => Array.from(element.querySelectorAll('.p-library .p-library__tags > li')).every((liElement) => liElement.textContent !== tagName))
			.forEach((element) => {
				element.hidden = true;
			});

		/* セクション内の表示要素が0件になった場合はセクションごと非表示にする */
		Array.from(librarySectionElements)
			.filter((element) => element.querySelectorAll('.p-library:not([hidden])').length === 0)
			.forEach((element) => {
				element.hidden = true;
			});

		/* 当該タグボタンを非活性にする */
		Array.from(tagButtonElements)
			.filter((element) => element.textContent === tagName)
			.forEach((element) => {
				element.disabled = true;
			});
	}
};

narrowDown(new URL(location.toString()).searchParams.get(URL_PARAM_TAG) ?? undefined);

tagButtonElements.forEach((tagButtonElement): void => {
	tagButtonElement.addEventListener(
		'click',
		(): void => {
			const tagName = tagButtonElement.textContent;
			if (tagName === null) {
				return;
			}

			const url = new URL(location.toString());
			url.searchParams.set(URL_PARAM_TAG, tagName);

			history.pushState({}, '', url);

			narrowDown(tagName);
		},
		{ passive: true }
	);
});

window.addEventListener(
	'popstate',
	(): void => {
		narrowDown(new URL(location.toString()).searchParams.get(URL_PARAM_TAG) ?? undefined);
	},
	{ passive: true }
);

window.addEventListener(
	'hashchange',
	(ev: HashChangeEvent): void => {
		const url = new URL(ev.newURL);
		url.searchParams.delete(URL_PARAM_TAG);

		history.replaceState({}, '', url);

		narrowDown();

		/* 当該要素までスクロールする */
		document.getElementById(decodeURIComponent(url.hash.substring(1).replaceAll('+', ' ')))?.scrollIntoView();
	},
	{ passive: true }
);
