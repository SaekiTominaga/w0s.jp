/**
 * スクロールスナップの設定を行う
 *
 * @param tableElement - <table> 要素
 */
const setScrollSnap = (tableElement: HTMLTableElement): void => {
	const theadElement = tableElement.tHead;
	if (theadElement === null) {
		return;
	}

	tableElement.style.setProperty('--stickey-thead-block-size', `${String(theadElement.scrollHeight)}px`);
};

/**
 * <thead> の sticky スクロール量調整
 *
 * @param elements - 対象要素
 */
const tableTheadStickey = (elements: NodeListOf<Element>): void => {
	const tableElements = Array.from(elements).map((element): HTMLTableElement => {
		if (!(element instanceof HTMLTableElement)) {
			throw new Error('Element must be a `HTMLTableElement`');
		}

		return element;
	});

	tableElements.forEach((tableElement) => {
		setScrollSnap(tableElement);
	});

	if (tableElements.length >= 1) {
		window.addEventListener(
			'hashchange',
			(): void => {
				const id = location.hash.substring(1);
				if (id === '') {
					return;
				}

				const targetElement = tableElements.find((tableElement) => tableElement.contains(document.getElementById(id)));
				if (targetElement === undefined) {
					return;
				}

				setScrollSnap(targetElement);
			},
			{ passive: true },
		);
	}
};
export default tableTheadStickey;
