/**
 * 問い合わせフォーム
 */
export default class Contact {
	readonly #bodyElement: HTMLBodyElement;

	/* 問い合わせフォーム要素 */
	readonly #FORM_ELEMENT_ID = 'contact-form';
	readonly #formElement: HTMLFormElement;

	/* 確認ボタン（確認画面へ進む） */
	readonly #CONFIRM_BUTTON_ELEMENT_ID = 'js-confirm-button';
	readonly #confirmButtonElement: HTMLButtonElement;

	/* 修正ボタン（入力画面へ戻る） */
	readonly #CORRECT_BUTTON_ELEMENT_ID = 'js-correct-button';
	readonly #correctButtonElement: HTMLButtonElement;

	/* 送信ボタン（完了画面へ進む） */
	readonly #SEND_BUTTON_ELEMENT_ID = 'js-send-button';
	readonly #sendButtonElement: HTMLButtonElement;

	readonly #inputScreenElements: NodeListOf<HTMLElement>; // 入力画面で表示する要素
	readonly #confirmScreenElements: NodeListOf<HTMLElement>; // 確認画面で表示する要素
	readonly #confirmOutputElements: NodeListOf<HTMLElement>; // 入力画面で入力した内容を確認画面で出力する要素

	readonly #CONFIRM_HASH = 'confirm'; // 確認画面の URL に使用するハッシュ値

	constructor() {
		this.#bodyElement = document.body as HTMLBodyElement; // <body> 要素

		const formElement = document.getElementById(this.#FORM_ELEMENT_ID) as HTMLFormElement | null; // 問い合わせフォーム要素
		if (formElement === null) {
			throw new Error(`Element: #${this.#FORM_ELEMENT_ID} can not found.`);
		}
		this.#formElement = formElement;

		const confirmButtonElement = document.getElementById(this.#CONFIRM_BUTTON_ELEMENT_ID) as HTMLButtonElement | null; // 確認ボタン（確認画面へ進む）
		if (confirmButtonElement === null) {
			throw new Error(`Element: #${this.#CONFIRM_BUTTON_ELEMENT_ID} can not found.`);
		}
		this.#confirmButtonElement = confirmButtonElement;

		const correctButtonElement = document.getElementById(this.#CORRECT_BUTTON_ELEMENT_ID) as HTMLButtonElement | null; // 修正ボタン（入力画面へ戻る）
		if (correctButtonElement === null) {
			throw new Error(`Element: #${this.#CORRECT_BUTTON_ELEMENT_ID} can not found.`);
		}
		this.#correctButtonElement = correctButtonElement;

		const sendButtonElement = document.getElementById(this.#SEND_BUTTON_ELEMENT_ID) as HTMLButtonElement | null; // 送信ボタン（完了画面へ進む）
		if (sendButtonElement === null) {
			throw new Error(`Element: #${this.#SEND_BUTTON_ELEMENT_ID} can not found.`);
		}
		this.#sendButtonElement = sendButtonElement;

		this.#inputScreenElements = document.querySelectorAll('.js-screen-input'); // 入力画面で表示する要素
		this.#confirmScreenElements = document.querySelectorAll('.js-screen-confirm'); // 確認画面で表示する要素
		this.#confirmOutputElements = document.querySelectorAll('.js-confirm-output'); // 入力画面で入力した内容を確認画面で出力する要素
	}

	/**
	 * 初期処理
	 */
	init(): void {
		this.#bodyElement.tabIndex = -1; // ボタン押下時にページ先頭へ focus() させるため
		this.#confirmButtonElement.type = 'submit'; // HTMLInputElement.setCustomValidity() でツールチップを出すためにボタンは Submit Button 状態とする

		this.#stepChange();
		window.addEventListener('hashchange', (): void => {
			this.#stepChange();
		});

		/* 入力画面にて確認ボタン押下（確認画面へ進む） */
		this.#confirmButtonElement.addEventListener('click', (ev: MouseEvent): void => {
			ev.preventDefault();

			if (this.#formElement.checkValidity()) {
				this.#stepChangeButtonClick(this.#CONFIRM_HASH);
			}
		});

		/* 確認画面にて修正ボタン押下（入力画面へ戻る） */
		this.#correctButtonElement.addEventListener('click', (): void => {
			this.#stepChangeButtonClick('');
		});
	}

	/**
	 * 画面状態変更時（入力画面→確認画面などの切り替え）の処理
	 */
	#stepChange(): void {
		switch (location.hash.substring(1)) {
			/* 確認画面 */
			case this.#CONFIRM_HASH:
				this.#inputScreenElements.forEach((inputScreenElement) => {
					inputScreenElement.hidden = true;
				});
				this.#confirmScreenElements.forEach((confirmScreenElement) => {
					confirmScreenElement.hidden = false;
				});
				this.#sendButtonElement.disabled = false;

				/* 入力内容を出力する */
				this.#confirmOutputElements.forEach((confirmOutputElement) => {
					const formCtrlName = confirmOutputElement.dataset['ctrlName'];
					if (formCtrlName === undefined) {
						throw new Error('Attribute: `data-ctrl-name` is not set.');
					}

					const formCtrls = this.#formElement.elements.namedItem(formCtrlName) as
						| HTMLInputElement
						| HTMLSelectElement
						| HTMLTextAreaElement
						| RadioNodeList
						| undefined;

					if (formCtrls === undefined) {
						throw new Error(`name: ${formCtrlName} is none.`);
					}

					let { value } = formCtrls;

					switch (Object.prototype.toString.call(formCtrls)) {
						case '[object HTMLInputElement]':
							if ((formCtrls as HTMLInputElement).type === 'checkbox') {
								/* 単体チェックボックス */
								value = Contact.#getLabelTextFormControl(formCtrls as HTMLInputElement);
							}

							break;
						case '[object RadioNodeList]':
							if (value === '') {
								/* ラジオボタン（未選択時）またはチェックボックス群 */
								const labelTextList: string[] = [];
								Array.from(formCtrls as RadioNodeList)
									.filter((formCtrl: Node): boolean => (formCtrl as HTMLInputElement).checked)
									.forEach((formCtrlElement) => {
										labelTextList.push(Contact.#getLabelTextFormControl(formCtrlElement as HTMLInputElement));
									});
								value = labelTextList.join('、');
							} else {
								/* ラジオボタン（選択時） */
								Array.from(formCtrls as RadioNodeList)
									.filter((formCtrlElement) => (formCtrlElement as HTMLInputElement).value === value)
									.forEach((formCtrlElement) => {
										value = Contact.#getLabelTextFormControl(formCtrlElement as HTMLInputElement);
									});
							}

							break;
						default:
					}

					confirmOutputElement.textContent = value;
				});

				break;

			/* 入力画面 */
			default:
				this.#inputScreenElements.forEach((inputScreenElement) => {
					inputScreenElement.hidden = false;
				});
				this.#confirmScreenElements.forEach((confirmScreenElement) => {
					confirmScreenElement.hidden = true;
				});
				this.#sendButtonElement.disabled = true;
		}
	}

	/**
	 * 画面状態を変更するボタン押下時の処理
	 *
	 * @param hash - URL のハッシュ値
	 */
	#stepChangeButtonClick(hash: string): void {
		history.pushState(null, '', hash === '' ? location.pathname : `#${hash}`);
		window.scroll(0, 0);
		this.#bodyElement.focus();

		this.#stepChange();
	}

	/**
	 * フォームコントロール（<input> など）のラベルテキストを取得する
	 *
	 * @param formCtrl - フォームコントロール
	 *
	 * @returns ラベルテキスト（ラベルが存在しない場合は value 属性値）
	 */
	static #getLabelTextFormControl(formCtrl: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
		const labelElements = formCtrl.labels;
		if (labelElements === null || labelElements.length === 0) {
			console.info('label does not exist', formCtrl);
			return formCtrl.value;
		}

		const labelTextList: string[] = [];
		labelElements.forEach((labelElement) => {
			const labelText = labelElement.textContent;
			if (labelText !== null) {
				labelTextList.push(labelText);
			}
		});

		return labelTextList.join(', ');
	}
}
