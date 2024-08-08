import ButtonCheckboxes from '@w0s/button-checkboxes';
import ButtonClipboard from '@w0s/button-clipboard';
import ButtonConfirm from '@w0s/button-confirm';
import ButtonMediaSamePlay from '@w0s/button-media-same-play';
import DetailsAnimation from '@w0s/details-animation';
import FootnoteReferencePopover from '@w0s/footnote-reference-popover';
import FormControlValidation from '@w0s/form-control-validation';
import FormSubmitOverlay from '@w0s/form-submit-overlay';
import InputDateToText from '@w0s/input-date-to-text';
import InputSwitch from '@w0s/input-switch';
import ReportJsError from '@w0s/report-js-error';
import StringConvert from '@w0s/string-convert';
import TextareaAutoSize from '@w0s/textarea-auto-size';
import GoogleAdsense from './unique/GoogleAdsense.js';
import SidebarBlogNewly from './unique/SidebarBlogNewly.js';
import TableTheadStickey from './component/TableTheadStickey.js';

/**
 * w0s.jp（エラーページを除く）
 */
new ReportJsError('https://report.w0s.jp/js', {
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

/* <input type="switch"> */
if (document.querySelector('w0s-input-switch') !== null) {
	customElements.define('w0s-input-switch', InputSwitch);
}

/* ツールチップ */
for (const targetElement of document.querySelectorAll<HTMLAnchorElement>('.js-footnote-reference-popover')) {
	new FootnoteReferencePopover(targetElement);
}

/* アニメーション <details> */
for (const targetElement of document.querySelectorAll<HTMLDetailsElement>('.js-details-animation')) {
	new DetailsAnimation(targetElement);
}

/* クリップボード書き込みボタン */
for (const targetElement of document.querySelectorAll<HTMLButtonElement>('.js-button-clipboard')) {
	new ButtonClipboard(targetElement);
}

/* ボタン押下時に確認メッセージを表示 */
for (const targetElement of document.querySelectorAll<HTMLButtonElement>('.js-button-confirm')) {
	new ButtonConfirm(targetElement);
}

/* チェックボックス群の全選択/全解除ボタン */
for (const targetElement of document.querySelectorAll<HTMLButtonElement>('.js-button-checkboxes')) {
	new ButtonCheckboxes(targetElement);
}

/* 複数音声/動画の同時再生ボタン */
for (const targetElement of document.querySelectorAll<HTMLButtonElement>('.js-button-media-same-play')) {
	new ButtonMediaSamePlay(targetElement);
}

/* 日付入力欄を <input type="text"> で表示 */
for (const targetElement of document.querySelectorAll<HTMLInputElement>('.js-input-date-to-text')) {
	new InputDateToText(targetElement);
}

/* <textarea> 要素の高さを入力内容に応じて自動調整 */
for (const targetElement of document.querySelectorAll<HTMLTextAreaElement>('.js-textarea-auto-size')) {
	new TextareaAutoSize(targetElement);
}

/* 送信ボタン2度押し防止 */
for (const formElement of document.querySelectorAll<HTMLFormElement>('.js-submit-overlay')) {
	new FormSubmitOverlay(formElement);
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
const sidebarBlogNewlyTemplateElement = document.getElementById('sidebar-blog-newly-template') as HTMLTemplateElement | null;
if (sidebarBlogNewlyTemplateElement !== null) {
	await new SidebarBlogNewly(sidebarBlogNewlyTemplateElement).init();
}

/* オートフォーカス TODO: フォームコントロール以外への `autofocus` 属性が全ブラウザ対応すれば JS 処理は不要になる <https://caniuse.com/mdn-html_global_attributes_autofocus> */
const autoFocusElement = document.querySelector<HTMLElement>('.js-autofocus');
if (autoFocusElement !== null) {
	if (autoFocusElement.tabIndex === -1) {
		/* tabIndex IDL のデフォルト値は -1 <https://html.spec.whatwg.org/multipage/interaction.html#dom-tabindex> */
		autoFocusElement.tabIndex = -1;
	}
	autoFocusElement.focus();
	autoFocusElement.scrollIntoView();
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
		{ passive: true },
	);
}

/* 入力バリデーション（エラー時はメッセージを画面表示する） */
for (const validationElement of document.querySelectorAll<HTMLElement>('.js-validation')) {
	new FormControlValidation(validationElement);
}

/* Google AdSense */
for (const adsGoogleElement of document.querySelectorAll('.js-ads-google')) {
	new GoogleAdsense(adsGoogleElement).init('100px');
}
