/**
 * 問い合わせフォーム
 */
const CONFIRM_HASH = 'confirm'; // 確認画面の URL に使用するハッシュ値

const $form = document.querySelector<HTMLFormElement>('#contact-form'); // 問い合わせフォーム要素

const $confirmButton = document.querySelector<HTMLButtonElement>('#js-confirm-button'); // 確認ボタン（確認画面へ進む）
const $correctButton = document.querySelector<HTMLButtonElement>('#js-correct-button'); // 修正ボタン（入力画面へ戻る）
const $sendButton = document.querySelector<HTMLButtonElement>('#js-send-button'); // 送信ボタン（完了画面へ進む）

const $$inputScreen = document.querySelectorAll<HTMLElement>('.js-screen-input'); // 入力画面で表示する要素
const $$confirmScreen = document.querySelectorAll<HTMLElement>('.js-screen-confirm'); // 確認画面で表示する要素
const $$confirmOutput = document.querySelectorAll<HTMLOutputElement>('.js-confirm-output'); // 入力画面で入力した内容を確認画面で出力する要素

/**
 * 画面状態変更時（入力画面→確認画面などの切り替え）の処理
 *
 * @param elements - 要素
 * @param elements.$$inputScreen - 入力画面で表示する要素
 * @param elements.$$confirmScreen - 確認画面で表示する要素
 * @param elements.$$confirmOutput - 入力画面で入力した内容を確認画面で出力する要素
 * @param elements.$sendButton - 送信ボタン（完了画面へ進む）
 */
const stepChange = (elements: {
	$$inputScreen: NodeListOf<HTMLElement>;
	$$confirmScreen: NodeListOf<HTMLElement>;
	$$confirmOutput: NodeListOf<HTMLOutputElement>;
	$sendButton: HTMLButtonElement | null;
}): void => {
	switch (location.hash.slice(1)) {
		/* 確認画面 */
		case CONFIRM_HASH: {
			elements.$$inputScreen.forEach(($inputScreen) => {
				$inputScreen.hidden = true;
			});
			elements.$$confirmScreen.forEach(($confirmScreen) => {
				$confirmScreen.hidden = false;
			});
			if (elements.$sendButton !== null) {
				elements.$sendButton.disabled = false;
			}

			/* 入力内容を出力する */
			elements.$$confirmOutput.forEach(($confirmOutput) => {
				const value = [...$confirmOutput.htmlFor].map((formCtrlId): string => {
					const $element = document.querySelector(`#${formCtrlId}`);
					if ($element === null) {
						throw new Error(`Element \`#${formCtrlId}\` not found`);
					}

					if ($element instanceof HTMLInputElement || $element instanceof HTMLTextAreaElement) {
						return $element.value;
					} else if ($element.role === 'radiogroup') {
						const $$label = [...$element.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(($radio) => $radio.checked)?.labels;
						if ($$label !== null && $$label !== undefined) {
							return [...$$label].map(($label) => $label.textContent).join(',');
						}
					}

					throw new Error(`Element \`#${formCtrlId}\` must be an HTMLInputElement, an HTMLTextAreaElement, or have \`role=radiogroup\``);
				});

				$confirmOutput.textContent = value.join(',');
			});

			break;
		}

		/* 入力画面 */
		default: {
			elements.$$inputScreen.forEach(($inputScreen) => {
				$inputScreen.hidden = false;
			});
			elements.$$confirmScreen.forEach(($confirmScreen) => {
				$confirmScreen.hidden = true;
			});
			if (elements.$sendButton !== null) {
				elements.$sendButton.disabled = true;
			}
		}
	}
};

/**
 * 画面状態を変更するボタン押下時の処理
 *
 * @param hash - URL のハッシュ値
 * @param elements - 要素
 * @param elements.$$inputScreen - 入力画面で表示する要素
 * @param elements.$$confirmScreen - 確認画面で表示する要素
 * @param elements.$$confirmOutput - 入力画面で入力した内容を確認画面で出力する要素
 * @param elements.$sendButton - 送信ボタン（完了画面へ進む）
 */
const stepChangeButtonClick = (
	hash: string,
	elements: {
		$$inputScreen: NodeListOf<HTMLElement>;
		$$confirmScreen: NodeListOf<HTMLElement>;
		$$confirmOutput: NodeListOf<HTMLOutputElement>;
		$sendButton: HTMLButtonElement | null;
	},
): void => {
	history.pushState({}, '', hash === '' ? location.pathname : `#${hash}`);
	window.scroll(0, 0);
	document.body.focus();

	stepChange(elements);
};

document.addEventListener('DOMContentLoaded', () => {
	document.body.tabIndex = -1; // ボタン押下時にページ先頭へ focus() させるため

	if ($confirmButton !== null) {
		$confirmButton.type = 'submit'; // HTMLInputElement.setCustomValidity() でツールチップを出すためにボタンは Submit Button 状態とする
	}

	stepChange({
		$$inputScreen: $$inputScreen,
		$$confirmScreen: $$confirmScreen,
		$$confirmOutput: $$confirmOutput,
		$sendButton: $sendButton,
	});
});
globalThis.addEventListener('hashchange', (): void => {
	stepChange({
		$$inputScreen: $$inputScreen,
		$$confirmScreen: $$confirmScreen,
		$$confirmOutput: $$confirmOutput,
		$sendButton: $sendButton,
	});
});

/* 入力画面にて確認ボタン押下（確認画面へ進む） */
$confirmButton?.addEventListener('click', (ev: MouseEvent): void => {
	ev.preventDefault();

	if ($form?.checkValidity()) {
		stepChangeButtonClick(CONFIRM_HASH, {
			$$inputScreen: $$inputScreen,
			$$confirmScreen: $$confirmScreen,
			$$confirmOutput: $$confirmOutput,
			$sendButton: $sendButton,
		});
	}
});

/* 確認画面にて修正ボタン押下（入力画面へ戻る） */
$correctButton?.addEventListener('click', (): void => {
	stepChangeButtonClick('', {
		$$inputScreen: $$inputScreen,
		$$confirmScreen: $$confirmScreen,
		$$confirmOutput: $$confirmOutput,
		$sendButton: $sendButton,
	});
});
