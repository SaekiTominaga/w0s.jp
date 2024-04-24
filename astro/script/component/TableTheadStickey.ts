/**
 * <thead> が sticky する <table> 要素
 */
export default class {
	readonly #thisElement: HTMLTableElement; // 対象要素

	readonly #pageAnchorClickEventListener: (ev: Event) => void;

	/**
	 * @param thisElement - Target element
	 */
	constructor(thisElement: HTMLTableElement) {
		this.#thisElement = thisElement;

		this.#pageAnchorClickEventListener = this.#pageAnchorClickEvent.bind(this);
	}

	/**
	 * 初期処理
	 */
	init(): void {
		this.#setScrollSnap();

		for (const pageAnchorElement of document.querySelectorAll('a[href^="#"]')) {
			pageAnchorElement.addEventListener('click', this.#pageAnchorClickEventListener, { passive: true });
		}
	}

	/**
	 * スクロールスナップの設定を行う
	 */
	#setScrollSnap(): void {
		const theadElement = this.#thisElement.tHead;
		if (theadElement === null) {
			return;
		}

		this.#thisElement.style.setProperty('--stickey-thead-block-size', `${String(theadElement.scrollHeight)}px`);
	}

	/**
	 * ページ内アンカーをクリックした時の処理
	 *
	 * @param ev - Event
	 */
	#pageAnchorClickEvent(ev: Event): void {
		const targetElement = ev.currentTarget;
		if (!(targetElement instanceof HTMLAnchorElement)) {
			throw new TypeError('Clicked element is not HTMLAnchorElement');
		}

		const id = new URL(targetElement.href).hash.substring(1);
		if (id !== '' && this.#thisElement.contains(document.getElementById(id))) {
			this.#setScrollSnap();
		}
	}
}
