/* eslint-disable lines-between-class-members */
/**
 * 問い合わせフォーム
 */
export default class Contact {
	#bodyElement: HTMLBodyElement;

	/* 問い合わせフォーム要素 */
	#FORM_ELEMENT_ID = 'contact-form';
	#formElement: HTMLFormElement;

	/* 確認ボタン（確認画面へ進む） */
	#CONFIRM_BUTTON_ELEMENT_ID = 'js-confirm-button';
	#confirmButtonElement: HTMLButtonElement;

	/* 修正ボタン（入力画面へ戻る） */
	#CORRECT_BUTTON_ELEMENT_ID = 'js-correct-button';
	#correctButtonElement: HTMLButtonElement;

	/* 送信ボタン（完了画面へ進む） */
	#SEND_BUTTON_ELEMENT_ID = 'js-send-button';
	#sendButtonElement: HTMLButtonElement;

	#inputScreenElements: NodeListOf<HTMLElement>; // 入力画面で表示する要素
	#confirmScreenElements: NodeListOf<HTMLElement>; // 確認画面で表示する要素
	#confirmOutputElements: NodeListOf<HTMLElement>; // 入力画面で入力した内容を確認画面で出力する要素

	#CONFIRM_HASH = 'confirm'; // 確認画面の URL に使用するハッシュ値

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
				for (const inputScreenElement of this.#inputScreenElements) {
					inputScreenElement.hidden = true;
				}
				for (const confirmScreenElement of this.#confirmScreenElements) {
					confirmScreenElement.hidden = false;
				}
				this.#sendButtonElement.disabled = false;

				/* 入力内容を出力する */
				for (const confirmOutputElement of this.#confirmOutputElements) {
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
								for (const formCtrlRlrmrnt of Array.from(formCtrls as RadioNodeList).filter(
									(formCtrl: Node): boolean => (formCtrl as HTMLInputElement).checked,
								)) {
									labelTextList.push(Contact.#getLabelTextFormControl(formCtrlRlrmrnt as HTMLInputElement));
								}
								value = labelTextList.join('、');
							} else {
								/* ラジオボタン（選択時） */
								for (const formCtrlElement of Array.from(formCtrls as RadioNodeList).filter(
									(formCtrl: Node): boolean => (formCtrl as HTMLInputElement).value === value,
								)) {
									value = Contact.#getLabelTextFormControl(formCtrlElement as HTMLInputElement);
								}
							}

							break;
						default:
					}

					confirmOutputElement.textContent = value;
				}

				break;

			/* 入力画面 */
			default:
				for (const inputScreenElement of this.#inputScreenElements) {
					inputScreenElement.hidden = false;
				}
				for (const confirmScreenElement of this.#confirmScreenElements) {
					confirmScreenElement.hidden = true;
				}
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
		const labelElements = formCtrl.labels!;
		if (labelElements.length === 0) {
			console.info('label does not exist', formCtrl);
			return formCtrl.value;
		}

		const labelTextList: string[] = [];
		for (const labelElement of labelElements) {
			const labelText = labelElement.textContent;
			if (labelText !== null) {
				labelTextList.push(labelText);
			}
		}

		return labelTextList.join(', ');
	}
}
