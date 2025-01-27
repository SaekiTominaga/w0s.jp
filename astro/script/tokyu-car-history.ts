import { convert } from '@w0s/string-convert';
import TableCellDitto from '@w0s/table-cell-ditto';
import TokyuCarHistoryResultTableTrHover from './unique/TokyuCarHistoryResultTableTrHover.js';

/**
 * 東急電車資料室 - 車歴表
 */

/* 入力値を変換する */
const numCtrlElement = document.querySelector<HTMLInputElement>('.js-convert-tokyu-car-histroy-num');
if (numCtrlElement !== null) {
	numCtrlElement.addEventListener(
		'change',
		() => {
			numCtrlElement.value = convert(numCtrlElement.value, {
				trim: true,
				toHankakuEisu: true,
				toUpperCase: true,
				table: {
					'．': '.',
					'＊': '*',
				},
			});
		},
		{ passive: true },
	);
}

const resultTableElement = document.querySelector<HTMLTableElement>('.js-result-table');
if (resultTableElement !== null) {
	/* 直上と同じ内容のセルを「〃」で表示する */
	const dittoButtonElement = document.querySelector<HTMLInputElement>('.js-button-ditto');
	if (dittoButtonElement !== null) {
		const tableCellDitto = new TableCellDitto(resultTableElement);

		if (dittoButtonElement.checked) {
			tableCellDitto.convert();
		}

		dittoButtonElement.addEventListener(
			'change',
			() => {
				if (dittoButtonElement.checked) {
					tableCellDitto.convert();
				} else {
					tableCellDitto.unConvert();
				}
			},
			{ passive: true },
		);
	}

	/* 表の列をマウスオーバーしたとき、クラス名を付与してCSSでスタイルを設定できるようにする */
	for (const trElement of resultTableElement.querySelectorAll<HTMLTableRowElement>('tbody > tr')) {
		const resultTableTrHover = new TokyuCarHistoryResultTableTrHover(trElement);
		resultTableTrHover.connected();
	}
}
