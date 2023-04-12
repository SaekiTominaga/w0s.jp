import Html from './Html.js';

/**
 * リンクアンカーにホスト情報を付与
 *
 * <a href="https://example.com/" class="build-host">Link</a>
 * ↓
 * <a href="https://example.com/">Link</a><span>example.com</span>
 */
export default class HtmlAnchorHost extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <a> element to process
	 * @param {string} options.insert_position - Host information insertion position
	 * @param {object} options.parentheses - Parentheses at site name (Used in `alt` attribute values)
	 * @param {string} options.parentheses.before - Opening parentheses
	 * @param {string} options.parentheses.after - Closing parentheses
	 * @param {string} options.element - Element name of the element displaying host information (If not specified, 'span')
	 * @param {string} options.class - Class name of the element displaying host information
	 * @param {object[]} options.icon - Icon infomation
	 * @param {number} options.icon_size - Icon size (Used in `width` and `height` attribute values)
	 * @param {string} options.icon_class - Class name of the `<img>` element displaying icon
	 */
	convert(
		options: Readonly<{
			target_class: string;
			insert_position: InsertPosition;
			parentheses?: Readonly<{
				before?: string;
				after?: string;
			}>;
			element?: string;
			class?: string;
			icon?: Readonly<{
				host: string;
				name: string;
				src: string;
			}>[];
			icon_size?: number;
			icon_class?: string;
		}>
	): void {
		const targetClassName = options.target_class;
		const optionsHost = {
			insert_position: options.insert_position,
			parentheses: {
				before: options.parentheses?.before ?? '',
				after: options.parentheses?.after ?? '',
			},
			element: options.element ?? 'span',
			class: options.class,
			icon: options.icon,
			icon_size: options.icon_size,
			icon_class: options.icon_class,
		};

		this.document.querySelectorAll(`.${targetClassName}`).forEach((targetElement) => {
			Html.removeClassName(targetElement, targetClassName);

			const href = targetElement.getAttribute('href');
			if (href === null) {
				this.logger.warn('No `href` attribute', targetElement.textContent);
				return;
			}

			let url: URL;
			try {
				url = new URL(href);
			} catch {
				return;
			}

			const hostIcon = optionsHost.icon?.find((icon) => icon.host === url.host);

			if (hostIcon !== undefined) {
				const iconElement = this.document.createElement('img');
				iconElement.src = hostIcon.src;
				iconElement.alt = `${optionsHost.parentheses.before}${hostIcon.name}${optionsHost.parentheses.after}`;
				if (optionsHost.icon_size !== undefined) {
					iconElement.width = optionsHost.icon_size;
					iconElement.height = optionsHost.icon_size;
				}
				if (optionsHost.icon_class !== undefined) {
					iconElement.className = optionsHost.icon_class;
				}

				targetElement.insertAdjacentElement(optionsHost.insert_position, iconElement);
			} else {
				const hostElement = this.document.createElement(optionsHost.element);
				if (optionsHost.class !== undefined) {
					hostElement.className = optionsHost.class;
				}
				hostElement.textContent = `${optionsHost.parentheses.before}${url.host}${optionsHost.parentheses.after}`;

				targetElement.insertAdjacentElement(optionsHost.insert_position, hostElement);
			}
		});
	}
}
