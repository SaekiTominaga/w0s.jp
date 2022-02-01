import ButtonCheckboxesCtrl from '@saekitominaga/customelements-button-checkboxes-ctrl';
import ButtonClipboard from '@saekitominaga/customelements-button-clipboard';
import ButtonConfirm from '@saekitominaga/customelements-button-confirm';
import ButtonMediaSamePlay from '@saekitominaga/customelements-button-media-sameplay';
import DetailsAnimation from '@saekitominaga/customelements-details-animation';
import DetailsAnimationContent from '@saekitominaga/customelements-details-animation-content';
import FormBeforeUnloadConfirm from '@saekitominaga/htmlformelement-before-unload-confirm';
import FormControlValidation from '@saekitominaga/htmlformcontrolelement-validation';
import FormSubmitOverlay from '@saekitominaga/htmlformelement-submit-overlay';
import GoogleAdsense from './unique/GoogleAdsense';
import InputDateToText from '@saekitominaga/customelements-input-date-totext';
import InputSwitch from '@saekitominaga/customelements-input-switch';
import ReportJsError from '@saekitominaga/report-js-error';
import SidebarAmazonAd from './unique/SidebarAmazonAd';
import SidebarBlogNewly from './unique/SidebarBlogNewly';
import StringConvert from '@saekitominaga/string-convert';
import StyleSheetPrint from './unique/StyleSheetPrint';
import Tab from '@saekitominaga/customelements-tab';
import TextareaAutoheight from '@saekitominaga/customelements-textarea-autoheight';
import Tooltip from '@saekitominaga/customelements-tooltip';
import TooltipTrigger from '@saekitominaga/customelements-tooltip-trigger';

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

document.documentElement.classList.add('js-enabled');

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
		customElements.define('w0s-tooltip', Tooltip);
		customElements.define('w0s-tooltip-trigger', TooltipTrigger, {
			extends: 'a',
		});
	}

	if (document.querySelector('details[is="w0s-animation-details"]') !== null) {
		/* アニメーション <details> */
		customElements.define('w0s-animation-details-content', DetailsAnimationContent);
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
		(async () => {
			for (const formElement of <NodeListOf<HTMLFormElement>>document.querySelectorAll('.js-submit-overlay')) {
				new FormSubmitOverlay(formElement).init();
			}
		})();
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

/* 印刷用スタイルシート */
const stylesheetPrintElement = <HTMLLinkElement | null>document.getElementById('stylesheet-print');
if (stylesheetPrintElement !== null) {
	new StyleSheetPrint(stylesheetPrintElement).init();
}

const autoFocusElement = <HTMLElement | null>document.querySelector('.js-form-errors');
if (autoFocusElement !== null) {
	if (autoFocusElement.tabIndex === -1) {
		// tabIndex IDL のデフォルト値は -1 <https://html.spec.whatwg.org/multipage/interaction.html#dom-tabindex>
		autoFocusElement.tabIndex = -1;
	}
	autoFocusElement.focus();
}

/* 入力値の変換 */
for (const formCtrlElement of <NodeListOf<HTMLInputElement | HTMLTextAreaElement>>document.querySelectorAll('.js-convert-trim')) {
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
for (const validationElement of <NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>>document.querySelectorAll('.js-validation')) {
	new FormControlValidation(validationElement, '-invalid').init();
}

/* フォーム入力中にページが閉じられようとしたら確認メッセージを表示 */
for (const beforeunloadConfirmElement of <NodeListOf<HTMLFormElement>>document.querySelectorAll('.js-form-beforeunload-confirm')) {
	new FormBeforeUnloadConfirm(beforeunloadConfirmElement).init();
}

/* Google AdSense */
for (const adsGoogleElement of document.querySelectorAll('.js-ads-google')) {
	new GoogleAdsense(adsGoogleElement).init('100px');
}
