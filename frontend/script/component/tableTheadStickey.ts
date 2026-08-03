/**
 * スクロールスナップの設定を行う
 *
 * @param $table - <table> 要素
 */
const setScrollSnap = ($table: HTMLTableElement): void => {
	const $thead = $table.tHead;
	if ($thead === null) {
		return;
	}

	$table.style.setProperty('--stickey-thead-block-size', `${String($thead.scrollHeight)}px`);
};

/**
 * <thead> の sticky スクロール量調整
 *
 * @param $$element - 対象要素
 */
const tableTheadStickey = ($$element: NodeListOf<Element>): void => {
	const $$table = Array.from($$element).map(($element): HTMLTableElement => {
		if (!($element instanceof HTMLTableElement)) {
			throw new Error('Element must be a `HTMLTableElement`');
		}

		return $element;
	});

	$$table.forEach(($table) => {
		setScrollSnap($table);
	});

	if ($$table.length >= 1) {
		window.addEventListener(
			'hashchange',
			(): void => {
				const id = location.hash.substring(1);
				if (id === '') {
					return;
				}

				const $target = $$table.find(($table) => $table.contains(document.getElementById(id)));
				if ($target === undefined) {
					return;
				}

				setScrollSnap($target);
			},
			{ passive: true },
		);
	}
};
export default tableTheadStickey;
