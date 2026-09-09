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
import { convert } from '@w0s/string-convert';
import adsense from './component/adsense.ts';
import searchEngine from './component/searchEngine.ts';
import tableTheadStickey from './component/tableTheadStickey.ts';
import { blogNewly } from './unique/sidebar.ts';
import reportJsError from './util/reportJsError.ts';
import trustedTypes from './util/trustedTypes.ts';

/**
 * w0s.jp（エラーページを除く）
 */

/* JS エラーレポート */
reportJsError();

/* Trusted Types */
trustedTypes();

/* <input type="switch"> */
if (document.querySelector('w0s-input-switch') !== null) {
	customElements.define('w0s-input-switch', InputSwitch);
}

try {
	/* ツールチップ */
	footnoteReferencePopover(document.querySelectorAll('.js-footnote-reference-popover'));
} catch (error) {
	console.error(error);
}

try {
	/* アニメーション <details> */
	detailsAnimation(document.querySelectorAll('.js-details-animation'));
} catch (error) {
	console.error(error);
}

try {
	/* クリップボード書き込みボタン */
	buttonClipboard(document.querySelectorAll('.js-button-clipboard'));
} catch (error) {
	console.error(error);
}

try {
	/* ボタン押下時に確認メッセージを表示 */
	buttonConfirm(document.querySelectorAll('.js-button-confirm'));
} catch (error) {
	console.error(error);
}

try {
	/* チェックボックス群の全選択/全解除ボタン */
	buttonCheckboxes(document.querySelectorAll('.js-button-checkboxes'));
} catch (error) {
	console.error(error);
}

try {
	/* 複数音声/動画の同時再生ボタン */
	buttonMediaSamePlay(document.querySelectorAll('.js-button-media-same-play'));
} catch (error) {
	console.error(error);
}

try {
	/* 日付入力欄を <input type="text"> で表示 */
	inputDateToText(document.querySelectorAll('.js-input-date-to-text'));
} catch (error) {
	console.error(error);
}

try {
	/* 送信ボタン2度押し防止 */
	formSubmitOverlay(document.querySelectorAll('.js-submit-overlay'));
} catch (error) {
	console.error(error);
}

try {
	/* <thead> の sticky スクロール量調整 */
	tableTheadStickey(document.querySelectorAll('.js-thead-sticky-table:has([id])'));
} catch (error) {
	console.error(error);
}

try {
	/* 指定位置スクロール */
	document.querySelector<HTMLElement>('.js-scroll-into-view')?.scrollIntoView({
		behavior: 'instant',
	});
} catch (error) {
	console.error(error);
}

try {
	/* 入力値の変換 */
	document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.js-convert-trim').forEach(($formCtrl) => {
		$formCtrl.addEventListener(
			'change',
			() => {
				$formCtrl.value = convert($formCtrl.value, {
					trim: true,
				});
			},
			{ passive: true },
		);
	});
} catch (error) {
	console.error(error);
}

try {
	/* 入力バリデーション（エラー時はメッセージを画面表示する） */
	formControlValidation(document.querySelectorAll('.js-validation'));
} catch (error) {
	console.error(error);
}

try {
	/* 検索エンジン選択 */
	searchEngine(document.querySelector('.js-search-engine'));
} catch (error) {
	console.error(error);
}

try {
	/* 日記新着記事 */
	await blogNewly(document.querySelector('#sidebar-blog-newly-template'));
} catch (error) {
	console.error(error);
}

try {
	/* Google AdSense */
	adsense(document.querySelectorAll('.js-ads-google'), { rootMargin: '100px' });
} catch (error) {
	console.error(error);
}
