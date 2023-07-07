import Html from './Html.js';

/**
 * リンクアンカーに付随するアイコンを付与
 */
export default class HtmlAnchorIcon extends Html {
	/**
	 * 変換実行
	 *
	 * @param options - Options
	 * @param options.type.target_class - Class name of the <a> element to process
	 * @param options.type.insert_position - Icon insertion position
	 * @param options.type.icons - Icon infomation
	 */
	async convert(
		options: Readonly<{
			type: {
				target_class: string;
				icons: Readonly<{
					type: string;
					name: string;
					file_name: string;
				}>[];
			};
			host: {
				target_class: string;
				icons?: Readonly<{
					host: string;
					name: string;
					file_name: string;
				}>[];
			};
		}>,
	): Promise<void> {
		const typeTargetClassName = options.type.target_class;
		const typeIcons = options.type.icons;

		const hostTargetClassName = options.host.target_class;
		const hostIcons = options.host.icons;

		/* リンクアンカーにリソースタイプアイコンを付与 */
		await Promise.all(
			[...this.document.querySelectorAll(`.${typeTargetClassName}`)].map(async (targetElement) => {
				Html.removeClassName(targetElement, typeTargetClassName);

				const type = targetElement.getAttribute('type');
				if (type === null) {
					return;
				}

				const typeIcon = typeIcons.find((icon) => icon.type === type);
				if (typeIcon === undefined) {
					return;
				}

				/* EJS を解釈 */
				const html = await this.renderEjsFile(
					{
						icon: typeIcon,
					},
					'anchor-type',
				);
				targetElement.insertAdjacentHTML('afterend', html);
			}),
		);

		/* リンクアンカーにホスト情報を付与 */
		await Promise.all(
			[...this.document.querySelectorAll(`.${hostTargetClassName}`)].map(async (targetElement) => {
				Html.removeClassName(targetElement, hostTargetClassName);

				const href = targetElement.getAttribute('href');
				if (href === null) {
					console.warn('No `href` attribute', targetElement.textContent);
					return;
				}

				let url: URL;
				try {
					url = new URL(href);
				} catch {
					return;
				}

				const hostIcon = hostIcons?.find((icon) => icon.host === url.host);

				/* EJS を解釈 */
				const html = await this.renderEjsFile(
					{
						icon: hostIcon,
						url: url,
					},
					'anchor-host',
				);
				targetElement.insertAdjacentHTML('afterend', html);
			}),
		);
	}
}
