import { convert } from '@w0s/string-convert';
import TableCellDitto from '@w0s/table-cell-ditto';

/**
 * 東急電車資料室 - 車歴表
 */

/* 入力値を変換する */
const $numCtrl = document.querySelector<HTMLInputElement>('.js-convert-tokyu-car-histroy-num');
if ($numCtrl !== null) {
	$numCtrl.addEventListener(
		'change',
		() => {
			$numCtrl.value = convert($numCtrl.value, {
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

const $resultTable = document.querySelector<HTMLTableElement>('.js-result-table');
if ($resultTable !== null) {
	/* 直上と同じ内容のセルを「〃」で表示する */
	const $dittoButton = document.querySelector<HTMLInputElement>('.js-button-ditto');
	if ($dittoButton !== null) {
		const tableCellDitto = new TableCellDitto($resultTable);

		if ($dittoButton.checked) {
			tableCellDitto.convert();
		}

		$dittoButton.addEventListener(
			'change',
			() => {
				if ($dittoButton.checked) {
					tableCellDitto.convert();
				} else {
					tableCellDitto.unConvert();
				}
			},
			{ passive: true },
		);
	}
}
