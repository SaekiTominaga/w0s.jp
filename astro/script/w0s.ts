import buttonCheckboxes from '@w0s/button-checkboxes';
import buttonClipboard from '@w0s/button-clipboard';
import buttonConfirm from '@w0s/button-confirm';
import buttonMediaSamePlay from '@w0s/button-media-same-play';
import detailsAnimation from '@w0s/details-animation';
import footnoteReferencePopover from '@w0s/footnote-reference-popover';
import formControlValidation from '@w0s/form-control-validation';
import formSubmitOverlay from '@w0s/form-submit-overlay';
import inputDateToText from '@w0s/input-date-to-text';
import InputSwitch from '@w0s/input-switch';
import reportJsError from '@w0s/report-js-error';
import StringConvert from '@w0s/string-convert';
import textareaAutoSize from '@w0s/textarea-auto-size';
import GoogleAdsense from './unique/GoogleAdsense.js';
import SidebarBlogNewly from './unique/SidebarBlogNewly.js';
import TableTheadStickey from './component/TableTheadStickey.js';

/**
 * w0s.jp（エラーページを除く）
 */
reportJsError('https://report.w0s.jp/report/js', {
	fetchParam: {
		documentURL: 'documentURL',
		message: 'message',
		filename: 'jsURL',
		lineno: 'lineNumber',
		colno: 'columnNumber',
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
footnoteReferencePopover(document.querySelectorAll('.js-footnote-reference-popover'));

/* アニメーション <details> */
detailsAnimation(document.querySelectorAll('.js-details-animation'));

/* クリップボード書き込みボタン */
buttonClipboard(document.querySelectorAll('.js-button-clipboard'));

/* ボタン押下時に確認メッセージを表示 */
buttonConfirm(document.querySelectorAll('.js-button-confirm'));

/* チェックボックス群の全選択/全解除ボタン */
buttonCheckboxes(document.querySelectorAll('.js-button-checkboxes'));

/* 複数音声/動画の同時再生ボタン */
buttonMediaSamePlay(document.querySelectorAll('.js-button-media-same-play'));

/* 日付入力欄を <input type="text"> で表示 */
inputDateToText(document.querySelectorAll('.js-input-date-to-text'));

/* <textarea> 要素の高さを入力内容に応じて自動調整 */
textareaAutoSize(document.querySelectorAll('.js-textarea-auto-size'));

/* 送信ボタン2度押し防止 */
formSubmitOverlay(document.querySelectorAll('.js-submit-overlay'));

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
formControlValidation(document.querySelectorAll('.js-validation'));

/* Google AdSense */
for (const adsGoogleElement of document.querySelectorAll('.js-ads-google')) {
	new GoogleAdsense(adsGoogleElement).init('100px');
}
