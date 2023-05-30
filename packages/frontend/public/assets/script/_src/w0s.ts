import ButtonCheckboxesCtrl from '@saekitominaga/customelements-button-checkboxes-ctrl';
import ButtonClipboard from '@saekitominaga/customelements-button-clipboard';
import ButtonConfirm from '@saekitominaga/customelements-button-confirm';
import ButtonMediaSamePlay from '@saekitominaga/customelements-button-media-sameplay';
import DetailsAnimation from '@saekitominaga/customelements-details-animation';
import FormBeforeUnloadConfirm from '@saekitominaga/htmlformelement-before-unload-confirm';
import FormControlValidation from '@saekitominaga/htmlformcontrolelement-validation';
import FormSubmitOverlay from '@saekitominaga/htmlformelement-submit-overlay';
import InputDateToText from '@saekitominaga/customelements-input-date-totext';
import InputSwitch from '@saekitominaga/customelements-input-switch';
import ReportJsError from '@saekitominaga/report-js-error';
import StringConvert from '@saekitominaga/string-convert';
import Tab from '@saekitominaga/customelements-tab';
import TextareaAutoheight from '@saekitominaga/customelements-textarea-autoheight';
import TooltipTrigger from '@saekitominaga/customelements-tooltip-trigger';
import GoogleAdsense from './unique/GoogleAdsense.js';
import SidebarAmazonAd from './unique/SidebarAmazonAd.js';
import SidebarBlogNewly from './unique/SidebarBlogNewly.js';
import TableTheadStickey from './component/TableTheadStickey.js';

/**
 * w0s.jp（エラーページを除く）
 */
const reportJsError = new ReportJsError('https://report.w0s.jp/js', {
	fetchParam: {
		location: 'location',
		message: 'message',
		filename: 'filename',
		lineno: 'lineno',
		colno: 'colno',
	},
	fetchContentType: 'application/json',
	allowFilenames: [/^https:\/\/w0s\.jp\/assets\/script\/.+\.m?js$/],
	denyUAs: [/Googlebot\/2.1;/],
});
reportJsError.init();

if (window.customElements !== undefined) {
	if (document.querySelector('w0s-tab') !== null) {
		/* タブ */
		customElements.define('w0s-tab', Tab);
	}

	if (document.querySelector('w0s-input-switch') !== null) {
		/* <input type="switch"> */
		customElements.define('w0s-input-switch', InputSwitch);
	}

	if (document.querySelector('a[is="w0s-tooltip-trigger"]') !== null) {
		/* ツールチップ */
		customElements.define('w0s-tooltip-trigger', TooltipTrigger, {
			extends: 'a',
		});
	}

	if (document.querySelector('details[is="w0s-animation-details"]') !== null) {
		/* アニメーション <details> */
		customElements.define('w0s-animation-details', DetailsAnimation, {
			extends: 'details',
		});
	}

	if (document.querySelector('button[is="w0s-clipboard"]') !== null) {
		/* クリップボード書き込みボタン */
		customElements.define('w0s-clipboard', ButtonClipboard, {
			extends: 'button',
		});
	}

	if (document.querySelector('button[is="w0s-confirm-button"]') !== null) {
		/* ボタン押下時に確認メッセージを表示 */
		customElements.define('w0s-confirm-button', ButtonConfirm, {
			extends: 'button',
		});
	}

	if (document.querySelector('button[is="w0s-checkbox-allcheck"]') !== null) {
		/* チェックボックス群の全選択/全解除ボタン */
		customElements.define('w0s-checkbox-allcheck', ButtonCheckboxesCtrl, {
			extends: 'button',
		});
	}

	if (document.querySelector('button[is="w0s-simultaneous-playback"]') !== null) {
		/* 複数音声/動画の同時再生ボタン */
		customElements.define('w0s-simultaneous-playback', ButtonMediaSamePlay, {
			extends: 'button',
		});
	}

	if (document.querySelector('input[is="w0s-input-date-to-text"]') !== null) {
		/* 日付入力欄を <input type="text"> で表示 */
		customElements.define('w0s-input-date-to-text', InputDateToText, {
			extends: 'input',
		});
	}

	if (document.querySelector('textarea[is="w0s-textarea-height-adjust"]') !== null) {
		/* <textarea> 要素の高さを入力内容に応じて自動調整 */
		customElements.define('w0s-textarea-height-adjust', TextareaAutoheight, {
			extends: 'textarea',
		});
	}

	if (document.querySelector('.js-submit-overlay') !== null) {
		/* 送信ボタン2度押し防止 */
		for (const formElement of document.querySelectorAll<HTMLFormElement>('.js-submit-overlay')) {
			new FormSubmitOverlay(formElement).init();
		}
	}
}

/* <thead> の sticky スクロール量調整 */
if (document.querySelector('.p-table > :is(tbody, tfood) [id]') !== null) {
	for (const tableElement of document.querySelectorAll<HTMLTableElement>('.p-table')) {
		if (tableElement.querySelector(':scope > :is(tbody, tfood) [id]') !== null) {
			new TableTheadStickey(tableElement).init();
		}
	}
}

/* 日記新着記事 */
const sidebarBlogNewlyTemplateElement = <HTMLTemplateElement | null>document.getElementById('sidebar-blog-newly-template');
if (sidebarBlogNewlyTemplateElement !== null) {
	new SidebarBlogNewly(sidebarBlogNewlyTemplateElement).init();
}

/* Amazon 商品広告 */
const sidebarAmazonAdTemplateElement = <HTMLTemplateElement | null>document.getElementById('sidebar-amazon-ad-template');
if (sidebarAmazonAdTemplateElement !== null) {
	new SidebarAmazonAd(sidebarAmazonAdTemplateElement).init();
}

/* オートフォーカス TODO: フォームコントロール以外への `autofocus` 属性が全ブラウザ対応すれば JS 処理は不要になる <https://caniuse.com/mdn-html_global_attributes_autofocus> */
const autoFocusElement = <HTMLElement | null>document.querySelector('.js-autofocus');
if (autoFocusElement !== null) {
	if (autoFocusElement.tabIndex === -1) {
		// tabIndex IDL のデフォルト値は -1 <https://html.spec.whatwg.org/multipage/interaction.html#dom-tabindex>
		autoFocusElement.tabIndex = -1;
	}
	autoFocusElement.focus();
}

/* 入力値の変換 */
for (const formCtrlElement of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.js-convert-trim')) {
	formCtrlElement.addEventListener(
		'change',
		() => {
			formCtrlElement.value = StringConvert.convert(formCtrlElement.value, {
				trim: true,
			});
		},
		{ passive: true }
	);
}

/* 入力バリデーション（エラー時はメッセージを画面表示する） */
for (const validationElement of document.querySelectorAll<HTMLElement>('.js-validation')) {
	new FormControlValidation(validationElement).init();
}

/* フォーム入力中にページが閉じられようとしたら確認メッセージを表示 */
for (const beforeunloadConfirmElement of document.querySelectorAll<HTMLFormElement>('.js-form-beforeunload-confirm')) {
	new FormBeforeUnloadConfirm(beforeunloadConfirmElement).init();
}

/* Google AdSense */
for (const adsGoogleElement of document.querySelectorAll('.js-ads-google')) {
	new GoogleAdsense(adsGoogleElement).init('100px');
}