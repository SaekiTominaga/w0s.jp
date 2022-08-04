/**
 * <thead> の sticky スクロール量調整
 */
export default class {
	readonly #tableClassName: string; // 対象 <table> 要素のクラス名

	readonly #pageAnchorClickEventListener: (ev: Event) => void;

	/**
	 * @param {string} tableClassName - 対象 <table> 要素のクラス名
	 */
	constructor(tableClassName: string) {
		this.#tableClassName = tableClassName;

		this.#pageAnchorClickEventListener = this.#pageAnchorClickEvent.bind(this);
	}

	/**
	 * 初期処理
	 */
	init(): void {
		const theadHeight = this.#getTheadHeight(location.hash);
		if (theadHeight !== undefined) {
			this.#scroll(theadHeight);
		}

		for (const pageAnchorElement of document.querySelectorAll('a[href^="#"]')) {
			pageAnchorElement.addEventListener('click', this.#pageAnchorClickEventListener, { passive: true });
		}
	}

	/**
	 * ページ内アンカーをクリックした時の処理
	 *
	 * @param {Event} ev - Event
	 */
	#pageAnchorClickEvent(ev: Event): void {
		const href = (<HTMLAnchorElement>ev.currentTarget).getAttribute('href');
		if (href !== null) {
			this.#scroll(this.#getTheadHeight(href));
		}
	}

	/**
	 * 対象要素が含まれる <table> 内にある <thead> 要素の高さを取得する
	 *
	 * @param {string} hash - URL のハッシュ
	 *
	 * @returns {number} <thead> 要素の高さ
	 */
	#getTheadHeight(hash: string): number | undefined {
		if (hash === '') {
			return undefined;
		}

		const targetElement = document.getElementById(hash.substring(1));

		const tableElement = targetElement?.closest(`.${this.#tableClassName}`);

		return tableElement?.querySelector('thead')?.scrollHeight;
	}

	/**
	 * スクロールを行う
	 *
	 * @param {number} scroll - スクロール量
	 */
	#scroll(scroll?: number): void {
		const rootElement = document.documentElement;
		if (rootElement.attributeStyleMap !== undefined) {
			rootElement.attributeStyleMap.set('scroll-padding-block-start', scroll !== undefined ? CSS.px(scroll) : 'auto');
		} else {
			rootElement.style.scrollPaddingBlockStart = scroll !== undefined ? `${scroll}px` : 'auto';
		}
	}
}
