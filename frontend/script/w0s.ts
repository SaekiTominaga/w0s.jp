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
import { convert } from '@w0s/string-convert';
import textareaAutoSize from '@w0s/textarea-auto-size';
import adsense from './unique/adsense.ts';
import { blogNewly } from './unique/sidebar.ts';
import TableTheadStickey from './component/TableTheadStickey.ts';

/**
 * w0s.jp（エラーページを除く）
 */
reportJsError({
	fetch: {
		endpoint: 'https://report.w0s.jp/report/js',
		param: {
			documentURL: 'documentURL',
			message: 'message',
			filename: 'jsURL',
			lineno: 'lineNumber',
			colno: 'columnNumber',
		},
		contentType: 'application/json',
	},
	validate: {
		filename: {
			allows: [/^https:\/\/w0s\.jp\/assets\/script\/.+\.m?js$/u],
		},
		ua: {
			denys: [/Googlebot\/2.1;/u],
		},
	},
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
	document.querySelectorAll<HTMLTableElement>('.p-table').forEach((tableElement) => {
		if (tableElement.querySelector(':scope > :is(tbody, tfood) [id]') !== null) {
			new TableTheadStickey(tableElement).init();
		}
	});
}

/* 日記新着記事 */
await blogNewly(document.getElementById('sidebar-blog-newly-template'));

/* 指定位置スクロール */
document.querySelector<HTMLElement>('.js-scroll-into-view')?.scrollIntoView({
	behavior: 'instant',
});

/* 入力値の変換 */
document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.js-convert-trim').forEach((formCtrlElement) => {
	formCtrlElement.addEventListener(
		'change',
		() => {
			formCtrlElement.value = convert(formCtrlElement.value, {
				trim: true,
			});
		},
		{ passive: true },
	);
});

/* 入力バリデーション（エラー時はメッセージを画面表示する） */
formControlValidation(document.querySelectorAll('.js-validation'));

/* Google AdSense */
adsense(document.querySelectorAll('.js-ads-google'), { rootMargin: '100px' });
