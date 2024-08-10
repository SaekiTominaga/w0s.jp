/**
 * 表の列をマウスオーバーしたとき、クラス名を付与してCSSでスタイルを設定できるようにする
 * （※rowspan 属性による行またがりがある場合、 :hover 疑似クラスでは意図したスタイルが設定できないため）
 */
export default class TokyuCarHistoryResultTableTrHover {
	readonly #thisElement: HTMLTableRowElement; // 対象要素

	#carNum: string | undefined; // 車号

	readonly #hoverClassName: string; // マウスオーバー時に付与するクラス名

	readonly #mouseOverEventListener: () => void;

	readonly #mouseOutEventListener: () => void;

	/**
	 * @param thisElement - 対象要素
	 * @param hoverClassName - マウスオーバー時に付与するクラス名
	 */
	constructor(thisElement: HTMLTableRowElement, hoverClassName = '-hover') {
		this.#thisElement = thisElement;

		this.#hoverClassName = hoverClassName;

		this.#mouseOverEventListener = this.#mouseOverEvent.bind(this);
		this.#mouseOutEventListener = this.#mouseOutEvent.bind(this);
	}

	/**
	 * 処理を実行する
	 */
	connected(): void {
		const { carNum } = this.#thisElement.dataset;
		if (carNum === undefined) {
			throw new Error('Attribute: `data-car-num` is not set.');
		}
		this.#carNum = carNum;

		this.#thisElement.addEventListener('mouseover', this.#mouseOverEventListener, { passive: true });
		this.#thisElement.addEventListener('mouseout', this.#mouseOutEventListener, { passive: true });
	}

	/**
	 * mouseover 時の処理内容
	 */
	#mouseOverEvent(): void {
		this.#thisElement.classList.add(this.#hoverClassName);

		let prevElement = this.#thisElement.previousElementSibling as HTMLElement | null;
		while (prevElement !== null && prevElement.dataset['carNum'] === this.#carNum) {
			prevElement.classList.add(this.#hoverClassName);
			prevElement = prevElement.previousElementSibling as HTMLElement | null;
		}

		let nextElement = this.#thisElement.nextElementSibling as HTMLElement | null;
		while (nextElement !== null && nextElement.dataset['carNum'] === this.#carNum) {
			nextElement.classList.add(this.#hoverClassName);
			nextElement = nextElement.nextElementSibling as HTMLElement | null;
		}
	}

	/**
	 * mouseout 時の処理内容
	 */
	#mouseOutEvent(): void {
		this.#thisElement.classList.remove(this.#hoverClassName);

		let prevElement = this.#thisElement.previousElementSibling as HTMLElement | null;
		while (prevElement !== null && prevElement.dataset['carNum'] === this.#carNum) {
			prevElement.classList.remove(this.#hoverClassName);
			prevElement = prevElement.previousElementSibling as HTMLElement | null;
		}

		let nextElement = this.#thisElement.nextElementSibling as HTMLElement | null;
		while (nextElement !== null && nextElement.dataset['carNum'] === this.#carNum) {
			nextElement.classList.remove(this.#hoverClassName);
			nextElement = nextElement.nextElementSibling as HTMLElement | null;
		}
	}
}
