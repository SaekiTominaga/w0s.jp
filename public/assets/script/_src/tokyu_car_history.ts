/**
 * 東急電車形態研究 - 車歴表
 */
import FormCtrlConvert from '@saekitominaga/htmlformcontrolelement-convert';
import TableCellDitto from '@saekitominaga/htmltablecellelement-ditto';
import TokyuCarHistoryResultTableTrHover from './unique/TokyuCarHistoryResultTableTrHover';

/* 入力値を変換する */
const numCtrlElement = <HTMLInputElement | null>document.querySelector('.js-convert-tokyu-car-histroy-num');
if (numCtrlElement !== null) {
	const formCtrlConvert = new FormCtrlConvert(numCtrlElement);
	formCtrlConvert.convert(
		{
			trim: true,
			toHankakuEisu: true,
			toUpperCase: true,
		},
		{
			'．': '.',
			'＊': '*',
		}
	);
}

const resultTableElement = <HTMLTableElement | null>document.querySelector('.js-result-table');
if (resultTableElement !== null) {
	/* 直上と同じ内容のセルを「〃」で表示する */
	const dittoButtonElement = <HTMLInputElement | null>document.querySelector('.js-button-ditto');
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
			{ passive: true }
		);
	}

	/* 表の列をマウスオーバーしたとき、クラス名を付与してCSSでスタイルを設定できるようにする */
	for (const trElement of <NodeListOf<HTMLTableRowElement>>resultTableElement.querySelectorAll('tbody > tr')) {
		const resultTableTrHover = new TokyuCarHistoryResultTableTrHover(trElement);
		resultTableTrHover.connected();
	}
}
