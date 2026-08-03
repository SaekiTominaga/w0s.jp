/**
 * 問い合わせフォーム
 */
export default class Contact {
	readonly #$body: HTMLBodyElement;

	/* 問い合わせフォーム要素 */
	readonly #FORM_ELEMENT_ID = 'contact-form';
	readonly #$form: HTMLFormElement;

	/* 確認ボタン（確認画面へ進む） */
	readonly #CONFIRM_BUTTON_ELEMENT_ID = 'js-confirm-button';
	readonly #$confirmButton: HTMLButtonElement;

	/* 修正ボタン（入力画面へ戻る） */
	readonly #CORRECT_BUTTON_ELEMENT_ID = 'js-correct-button';
	readonly #$correctButton: HTMLButtonElement;

	/* 送信ボタン（完了画面へ進む） */
	readonly #SEND_BUTTON_ELEMENT_ID = 'js-send-button';
	readonly #$sendButton: HTMLButtonElement;

	readonly #$$inputScreen: NodeListOf<HTMLElement>; // 入力画面で表示する要素
	readonly #$$confirmScreen: NodeListOf<HTMLElement>; // 確認画面で表示する要素
	readonly #$$confirmOutput: NodeListOf<HTMLElement>; // 入力画面で入力した内容を確認画面で出力する要素

	readonly #CONFIRM_HASH = 'confirm'; // 確認画面の URL に使用するハッシュ値

	constructor() {
		this.#$body = document.body as HTMLBodyElement; // <body> 要素

		const $form = document.getElementById(this.#FORM_ELEMENT_ID) as HTMLFormElement | null; // 問い合わせフォーム要素
		if ($form === null) {
			throw new Error(`Element: #${this.#FORM_ELEMENT_ID} can not found.`);
		}
		this.#$form = $form;

		const $confirmButton = document.getElementById(this.#CONFIRM_BUTTON_ELEMENT_ID) as HTMLButtonElement | null; // 確認ボタン（確認画面へ進む）
		if ($confirmButton === null) {
			throw new Error(`Element: #${this.#CONFIRM_BUTTON_ELEMENT_ID} can not found.`);
		}
		this.#$confirmButton = $confirmButton;

		const $correctButton = document.getElementById(this.#CORRECT_BUTTON_ELEMENT_ID) as HTMLButtonElement | null; // 修正ボタン（入力画面へ戻る）
		if ($correctButton === null) {
			throw new Error(`Element: #${this.#CORRECT_BUTTON_ELEMENT_ID} can not found.`);
		}
		this.#$correctButton = $correctButton;

		const $sendButton = document.getElementById(this.#SEND_BUTTON_ELEMENT_ID) as HTMLButtonElement | null; // 送信ボタン（完了画面へ進む）
		if ($sendButton === null) {
			throw new Error(`Element: #${this.#SEND_BUTTON_ELEMENT_ID} can not found.`);
		}
		this.#$sendButton = $sendButton;

		this.#$$inputScreen = document.querySelectorAll('.js-screen-input'); // 入力画面で表示する要素
		this.#$$confirmScreen = document.querySelectorAll('.js-screen-confirm'); // 確認画面で表示する要素
		this.#$$confirmOutput = document.querySelectorAll('.js-confirm-output'); // 入力画面で入力した内容を確認画面で出力する要素
	}

	/**
	 * 初期処理
	 */
	init(): void {
		this.#$body.tabIndex = -1; // ボタン押下時にページ先頭へ focus() させるため
		this.#$confirmButton.type = 'submit'; // HTMLInputElement.setCustomValidity() でツールチップを出すためにボタンは Submit Button 状態とする

		this.#stepChange();
		window.addEventListener('hashchange', (): void => {
			this.#stepChange();
		});

		/* 入力画面にて確認ボタン押下（確認画面へ進む） */
		this.#$confirmButton.addEventListener('click', (ev: MouseEvent): void => {
			ev.preventDefault();

			if (this.#$form.checkValidity()) {
				this.#stepChangeButtonClick(this.#CONFIRM_HASH);
			}
		});

		/* 確認画面にて修正ボタン押下（入力画面へ戻る） */
		this.#$correctButton.addEventListener('click', (): void => {
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
				this.#$$inputScreen.forEach(($inputScreen) => {
					$inputScreen.hidden = true;
				});
				this.#$$confirmScreen.forEach(($confirmScreen) => {
					$confirmScreen.hidden = false;
				});
				this.#$sendButton.disabled = false;

				/* 入力内容を出力する */
				this.#$$confirmOutput.forEach(($confirmOutput) => {
					const formCtrlName = $confirmOutput.dataset['ctrlName'];
					if (formCtrlName === undefined) {
						throw new Error('Attribute: `data-ctrl-name` is not set.');
					}

					const $$formCtrl = this.#$form.elements.namedItem(formCtrlName) as
						HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | RadioNodeList | undefined;

					if ($$formCtrl === undefined) {
						throw new Error(`name: ${formCtrlName} is none.`);
					}

					let { value } = $$formCtrl;

					switch (Object.prototype.toString.call($$formCtrl)) {
						case '[object HTMLInputElement]':
							if (($$formCtrl as HTMLInputElement).type === 'checkbox') {
								/* 単体チェックボックス */
								value = Contact.#getLabelTextFormControl($$formCtrl as HTMLInputElement);
							}

							break;
						case '[object RadioNodeList]':
							if (value === '') {
								/* ラジオボタン（未選択時）またはチェックボックス群 */
								const labelTextList: string[] = [];
								Array.from($$formCtrl as RadioNodeList)
									.filter(($formCtrl) => $formCtrl.checked)
									.forEach(($formCtrl) => {
										labelTextList.push(Contact.#getLabelTextFormControl($formCtrl));
									});
								value = labelTextList.join('、');
							} else {
								/* ラジオボタン（選択時） */
								Array.from($$formCtrl as RadioNodeList)
									.filter(($formCtrl) => $formCtrl.value === value)
									.forEach(($formCtrl) => {
										value = Contact.#getLabelTextFormControl($formCtrl);
									});
							}

							break;
						default:
					}

					$confirmOutput.textContent = value;
				});

				break;

			/* 入力画面 */
			default:
				this.#$$inputScreen.forEach(($inputScreen) => {
					$inputScreen.hidden = false;
				});
				this.#$$confirmScreen.forEach(($confirmScreen) => {
					$confirmScreen.hidden = true;
				});
				this.#$sendButton.disabled = true;
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
		this.#$body.focus();

		this.#stepChange();
	}

	/**
	 * フォームコントロール（<input> など）のラベルテキストを取得する
	 *
	 * @param $formCtrl - フォームコントロール
	 *
	 * @returns ラベルテキスト（ラベルが存在しない場合は value 属性値）
	 */
	static #getLabelTextFormControl($formCtrl: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
		const $$label = $formCtrl.labels;
		if ($$label === null || $$label.length === 0) {
			console.info('label does not exist', $formCtrl);
			return $formCtrl.value;
		}

		const labelTextList: string[] = [];
		$$label.forEach(($label) => {
			labelTextList.push($label.textContent);
		});

		return labelTextList.join(', ');
	}
}
