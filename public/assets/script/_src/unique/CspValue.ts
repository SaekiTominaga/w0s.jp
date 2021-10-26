/**
 * CSP の設定値を組み立てる
 */
export default class {
	/**
	 * <table> に記載された情報から設定値を組み立てる
	 *
	 * @param {string} tableElementId - CSP 情報が記載された <table> 要素の ID
	 * @param {string} outputElementId - 組み立てた値を出力する要素の ID
	 */
	static assembleForTable(tableElementId: string, outputElementId: string): void {
		const tableElement = document.getElementById(tableElementId);
		if (tableElement === null) {
			throw new Error(`Element: #${tableElementId} can not found.`);
		}

		const outputElement = document.getElementById(outputElementId);
		if (outputElement === null) {
			throw new Error(`Element: #${outputElementId} can not found.`);
		}

		const directiveList = [];

		for (const directiveNameElement of <NodeListOf<HTMLTableCellElement>>tableElement.querySelectorAll('tbody > tr > th:first-child')) {
			const directiveValueSize = directiveNameElement.rowSpan !== undefined ? directiveNameElement.rowSpan : 1;

			const directiveValueList: Array<string | null | undefined> = [];
			directiveValueList.push(directiveNameElement.nextElementSibling?.textContent);

			let nowTableRowElement = directiveNameElement.closest('tr');

			for (let index = 0; index < directiveValueSize - 1; index++) {
				nowTableRowElement = <HTMLTableRowElement>nowTableRowElement?.nextElementSibling;
				directiveValueList.push(nowTableRowElement?.querySelector('td')?.textContent);
			}

			directiveList.push(`${directiveNameElement.textContent} ${directiveValueList.join(' ')}`.trim());
		}

		const cspValue = directiveList.join('; ');

		outputElement.textContent = cspValue;
	}
}
