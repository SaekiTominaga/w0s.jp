/**
 * <thead> が sticky する <table> 要素
 */
export default class {
	readonly #thisElement: HTMLTableElement; // 対象要素

	readonly #theadElement: HTMLTableSectionElement | null; // <thead> 要素
	#theadHeight?: number; // <thead> 要素の高さ

	readonly #pageAnchorClickEventListener: (ev: Event) => void;

	/**
	 * @param {HTMLTableElement} thisElement - Target element
	 */
	constructor(thisElement: HTMLTableElement) {
		this.#thisElement = thisElement;
		this.#theadElement = thisElement.querySelector(':scope > thead');

		this.#pageAnchorClickEventListener = this.#pageAnchorClickEvent.bind(this);
	}

	/**
	 * 初期処理
	 */
	init(): void {
		this.#calcTheadHeight();
		this.#setScrollSnap();

		for (const pageAnchorElement of document.querySelectorAll('a[href^="#"]')) {
			pageAnchorElement.addEventListener('click', this.#pageAnchorClickEventListener, { passive: true });
		}
	}

	/**
	 * <thead> 要素の高さを算出する
	 *
	 * @returns {number} <thead> 要素の高さ
	 */
	#calcTheadHeight(): void {
		this.#theadHeight = this.#theadElement?.scrollHeight;
	}

	/**
	 * スクロールスナップの設定を行う
	 */
	#setScrollSnap(): void {
		if (this.#theadHeight === undefined) {
			return;
		}

		this.#thisElement.style.setProperty('--stickey-thead-height', `${this.#theadHeight}px`);
	}

	/**
	 * ページ内アンカーをクリックした時の処理
	 *
	 * @param {Event} ev - Event
	 */
	#pageAnchorClickEvent(ev: Event): void {
		const id = (<HTMLAnchorElement>ev.currentTarget).getAttribute('href')?.substring(1);
		if (id !== undefined && this.#thisElement.contains(document.getElementById(id))) {
			this.#calcTheadHeight();
			this.#setScrollSnap();
		}
	}
}
