/**
 * 表の列をマウスオーバーしたとき、クラス名を付与してCSSでスタイルを設定できるようにする
 * （※rowspan 属性による行またがりがある場合、 :hover 疑似クラスでは意図したスタイルが設定できないため）
 *
 * @version 2.0.0
 */
export default class {
	#thisElement: HTMLTableRowElement; // 対象要素

	#carNum: string | undefined; // 車号

	#hoverClassName: string; // マウスオーバー時に付与するクラス名

	#mouseOverEventListener: () => void;
	#mouseOutEventListener: () => void;

	/**
	 * @param {HTMLTableRowElement} thisElement - 対象要素
	 * @param {string} hoverClassName - マウスオーバー時に付与するクラス名
	 */
	constructor(thisElement: HTMLTableRowElement, hoverClassName = '-hover') {
		this.#thisElement = thisElement;

		this.#hoverClassName = hoverClassName;

		this.#mouseOverEventListener = this._mouseOverEvent.bind(this);
		this.#mouseOutEventListener = this._mouseOutEvent.bind(this);
	}

	/**
	 * 処理を実行する
	 */
	connected(): void {
		const carNum = this.#thisElement.dataset.carNum;
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
	private _mouseOverEvent(): void {
		this.#thisElement.classList.add(this.#hoverClassName);

		let prevElement = <HTMLElement | null>this.#thisElement.previousElementSibling;
		while (prevElement !== null && prevElement.dataset.carNum === this.#carNum) {
			prevElement.classList.add(this.#hoverClassName);
			prevElement = <HTMLElement | null>prevElement.previousElementSibling;
		}

		let nextElement = <HTMLElement | null>this.#thisElement.nextElementSibling;
		while (nextElement !== null && nextElement.dataset.carNum === this.#carNum) {
			nextElement.classList.add(this.#hoverClassName);
			nextElement = <HTMLElement | null>nextElement.nextElementSibling;
		}
	}

	/**
	 * mouseout 時の処理内容
	 */
	private _mouseOutEvent(): void {
		this.#thisElement.classList.remove(this.#hoverClassName);

		let prevElement = <HTMLElement | null>this.#thisElement.previousElementSibling;
		while (prevElement !== null && prevElement.dataset.carNum === this.#carNum) {
			prevElement.classList.remove(this.#hoverClassName);
			prevElement = <HTMLElement | null>prevElement.previousElementSibling;
		}

		let nextElement = <HTMLElement | null>this.#thisElement.nextElementSibling;
		while (nextElement !== null && nextElement.dataset.carNum === this.#carNum) {
			nextElement.classList.remove(this.#hoverClassName);
			nextElement = <HTMLElement | null>nextElement.nextElementSibling;
		}
	}
}
