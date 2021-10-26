/**
 * 富永日記帳・編集ページ
 */
const postElement = <HTMLElement>document.querySelector('#post'); // 記事投稿フォーム

/**
 * 本文に入力された文字列を解析して画像リストを取得し、記事のイメージ画像を選択できるようにする
 *
 * @param {HTMLTextAreaElement} messageCtrlElement - 本文入力欄
 * @param {HTMLTemplateElement} selectImageTemplateElement - 選択画像を表示する要素
 * @param {HTMLTemplateElement} selectImageErrorTemplateElement - エラー情報を表示する要素
 */
const messageImage = async (
	messageCtrlElement: HTMLTextAreaElement,
	selectImageTemplateElement: HTMLTemplateElement,
	selectImageErrorTemplateElement: HTMLTemplateElement
): Promise<void> => {
	const selectedImage = selectImageTemplateElement.dataset.selected;

	/* 取得した画像をHTMLに挿入 */
	let radioCheckedValue = '';

	/* いったんクリア */
	while (selectImageTemplateElement.nextElementSibling) {
		const radioCheckedElements = <NodeListOf<HTMLInputElement>>selectImageTemplateElement.nextElementSibling.querySelectorAll('input[type="radio"]:checked');
		if (radioCheckedElements.length === 1) {
			radioCheckedValue = radioCheckedElements[0].value;
		}
		selectImageTemplateElement.nextElementSibling.remove();
	}
	while (selectImageErrorTemplateElement.nextElementSibling) {
		selectImageErrorTemplateElement.nextElementSibling.remove();
	}

	const insertHTML = (imageUrlList: Set<string>): void => {
		const fragment = document.createDocumentFragment();
		for (const imageUrl of imageUrlList) {
			const templateElementClone = <HTMLElement>selectImageTemplateElement.content.cloneNode(true);

			const radioElement = <HTMLInputElement>templateElementClone.querySelector('input[type="radio"]');
			radioElement.value = imageUrl;
			if (radioCheckedValue !== '') {
				if (imageUrl === radioCheckedValue) {
					radioElement.checked = true;
				}
			} else {
				if (imageUrl === selectedImage) {
					radioElement.checked = true;
				}
			}

			const imgElement = <HTMLImageElement>templateElementClone.querySelector('img');
			if (imageUrl.search('https?://') === 0) {
				imgElement.src = imageUrl;
			} else {
				imgElement.src = `https://media.w0s.jp/thumbimage/blog/${imageUrl}?type=webp;w=360;h=360;quality=30`;
			}
			imgElement.alt = imageUrl;
			imgElement.title = imageUrl;

			fragment.appendChild(templateElementClone);
		}
		selectImageTemplateElement.parentNode?.appendChild(fragment);
	};

	const insertError = (errorMessageList: Set<string>): void => {
		const fragment = document.createDocumentFragment();
		for (const errorMessage of errorMessageList) {
			const templateElementClone = <HTMLElement>selectImageErrorTemplateElement.content.cloneNode(true);

			const liElement = <HTMLLIElement>templateElementClone.querySelector('li');
			liElement.textContent = errorMessage;

			fragment.appendChild(templateElementClone);
		}
		selectImageErrorTemplateElement.parentNode?.appendChild(fragment);
	};

	const imageUrlList: Set<string> = new Set(); // 画像パス
	const errorMessageList: Set<string> = new Set(); // エラーメッセージ

	const tweetIdList: string[] = []; // ツイートID
	const youtubeIdList: string[] = []; // YouTube ID
	const asinList: string[] = []; // ASIN

	/* 本文内のテキストから画像パスとASINを抜き出す */
	messageCtrlElement.value.split('\n').forEach((value: string): void => {
		const imageRegResult = /^\$(photo|image): ([^ ]+) (.+)/.exec(value);
		if (imageRegResult !== null) {
			imageUrlList.add(imageRegResult[2]);
		}

		const twitterRegResult = /^\$tweet: ([ 0-9]+)/.exec(value);
		if (twitterRegResult !== null) {
			twitterRegResult[1].split(' ').forEach((tweetId) => {
				tweetIdList.push(tweetId);
			});
		}

		const youtubeRegResult = /^\$youtube: ([^ ]+) ([0-9]+)x([0-9]+) (.+)/.exec(value);
		if (youtubeRegResult !== null) {
			youtubeIdList.push(youtubeRegResult[1]);
		}

		const asinRegResult = /^\$amazon: ([ 0-9A-Z]+)/.exec(value);
		if (asinRegResult !== null) {
			asinRegResult[1].split(' ').forEach((asin) => {
				asinList.push(asin);
			});
		}
	});

	/* Twitter */
	if (tweetIdList.length >= 1) {
		const formData = new FormData();
		for (const tweetId of tweetIdList) {
			formData.append('id[]', tweetId);
		}

		const response = await fetch('https://blog.w0s.jp/api/tweet', {
			method: 'POST',
			body: new URLSearchParams(<string[][]>[...formData]),
		});
		try {
			if (!response.ok) {
				throw new Error(`"${response.url}" is ${response.status} ${response.statusText}`);
			}
			const responseJson = await response.json();

			for (const imageUrl of <string[]>Object.values(responseJson.image_urls)) {
				imageUrlList.add(imageUrl);
			}
		} catch (e) {
			console.error(e); // TODO:
		}
	}

	/* YouTube */
	for (const youtubeId of youtubeIdList) {
		imageUrlList.add(`https://i1.ytimg.com/vi/${youtubeId}/hqdefault.jpg`);
		imageUrlList.add(`https://i1.ytimg.com/vi/${youtubeId}/1.jpg`);
		imageUrlList.add(`https://i1.ytimg.com/vi/${youtubeId}/2.jpg`);
		imageUrlList.add(`https://i1.ytimg.com/vi/${youtubeId}/3.jpg`);
	}

	/* Amazon */
	if (asinList.length >= 1) {
		const formData = new FormData();
		for (const asin of asinList) {
			formData.append('asin[]', asin);
		}

		const response = await fetch('https://blog.w0s.jp/api/amazon', {
			method: 'POST',
			body: new URLSearchParams(<string[][]>[...formData]),
		});
		try {
			if (!response.ok) {
				throw new Error(`"${response.url}" is ${response.status} ${response.statusText}`);
			}
			const responseJson = await response.json();

			for (const imageData of <string[]>Object.values(responseJson.images)) {
				imageUrlList.add(imageData);
			}
			for (const erroeMessageData of <string[]>Object.values(responseJson.errors)) {
				errorMessageList.add(erroeMessageData);
			}
		} catch (e) {
			console.error(e); // TODO:
		}
	}

	insertHTML(imageUrlList);
	insertError(errorMessageList);
};

/**
 * 本文プレビュー
 *
 * @param {HTMLTextAreaElement} messageCtrlElement - 本文入力欄
 * @param {HTMLFormElement} messagePreviewFormElement - 本文プレビューを行う <form> 要素
 * @param {HTMLFormElement} messagePreviewCtrlElement - 本文プレビューを行う <textarea> 要素
 */
const messagePreview = async (
	messageCtrlElement: HTMLTextAreaElement,
	messagePreviewFormElement: HTMLFormElement,
	messagePreviewCtrlElement: HTMLTextAreaElement
): Promise<void> => {
	messagePreviewCtrlElement.value = messageCtrlElement.value;
	messagePreviewFormElement.submit();
};

/**
 * 【記事投稿】本文入力欄の処理
 */
const messageCtrlElement = <HTMLTextAreaElement>postElement.querySelector('[name="message"]'); // 本文の入力コントロール
const messagePreviewFormElement = <HTMLFormElement>document.getElementById('message-preview-form'); // 本文プレビューを行う <form> 要素
const messagePreviewCtrlElement = <HTMLTextAreaElement>document.getElementById('message-preview-ctrl'); // 本文プレビューを行う <textarea> 要素
const selectImageTemplateElement = <HTMLTemplateElement>document.getElementById('select-image');
const selectImageErrorTemplateElement = <HTMLTemplateElement>document.getElementById('select-image-error');

(async () => {
	await messageImage(messageCtrlElement, selectImageTemplateElement, selectImageErrorTemplateElement);
	await messagePreview(messageCtrlElement, messagePreviewFormElement, messagePreviewCtrlElement);
})();
messageCtrlElement.addEventListener('change', (): void => {
	(async () => {
		await messageImage(messageCtrlElement, selectImageTemplateElement, selectImageErrorTemplateElement);
		await messagePreview(messageCtrlElement, messagePreviewFormElement, messagePreviewCtrlElement);
	})();
});

/**
 * 【記事投稿】送信時のチェック
 */
const postFormElement = <HTMLFormElement>postElement.querySelector('form'); // 記事投稿フォーム

postFormElement.addEventListener('submit', (ev: Event): void => {
	if (postFormElement.querySelectorAll('[name="category[]"]:checked').length === 0) {
		if (!confirm('カテゴリが選択されていません。このまま送信しますか?')) {
			ev.preventDefault();
		}
	}
});
