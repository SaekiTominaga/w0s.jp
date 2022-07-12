import Html from './Html.js';

/**
 * リンクアンカーにリソースタイプアイコンを付与
 */
export default class HtmlAnchorType extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <a> element to process
	 * @param {string} options.insert_position - Icon insertion position
	 * @param {object} options.parentheses - Parentheses at resource name (Used in `alt` attribute values)
	 * @param {string} options.parentheses.before - Opening parentheses
	 * @param {string} options.parentheses.after - Closing parentheses
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
			icon: Readonly<{
				type: string;
				name: string;
				src: string;
			}>[];
			icon_size?: number;
			icon_class?: string;
		}>
	): void {
		const targetClassName = options.target_class;
		const optionsIcon = {
			insert_position: options.insert_position,
			parentheses: {
				before: options.parentheses?.before ?? '',
				after: options.parentheses?.after ?? '',
			},
			icon: options.icon,
			icon_size: options.icon_size,
			icon_class: options.icon_class,
		};

		for (const targetElement of this.document.querySelectorAll(`.${targetClassName}`)) {
			this.removeClassName(targetElement, targetClassName);

			const type = targetElement.getAttribute('type');
			if (type !== null) {
				const typeIcon = optionsIcon.icon.find((icon) => icon.type === type);

				if (typeIcon !== undefined) {
					const iconElement = this.document.createElement('img');
					iconElement.src = typeIcon.src;
					iconElement.alt = `${optionsIcon.parentheses?.before}${typeIcon.name}${optionsIcon.parentheses?.after}`;
					if (optionsIcon.icon_size !== undefined) {
						iconElement.width = optionsIcon.icon_size;
						iconElement.height = optionsIcon.icon_size;
					}
					if (optionsIcon.icon_class !== undefined) {
						iconElement.className = optionsIcon.icon_class;
					}

					targetElement.insertAdjacentElement(optionsIcon.insert_position, iconElement);
				}
			}
		}
	}
}
