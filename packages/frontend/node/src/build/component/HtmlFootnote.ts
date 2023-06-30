import Html from './Html.js';

/**
 * 脚注
 *
 * <build-footnote-reference>脚注<em>強調</em>脚注</build-footnote-reference>
 * <build-footnote-reference>脚注<em>強調</em>脚注</build-footnote-reference>
 * ↓
 * <span class="c-annotate"><a href="#fn1" id="r1" is="w0s-tooltip-trigger">[1]</a></span>
 * <span class="c-annotate"><a href="#fn2" id="r2" is="w0s-tooltip-trigger">[2]</a></span>
 *
 * <section class="p-footnote">
 *   ...
 * </section>
 */
export default class HtmlFootnote extends Html {
	/**
	 * 変換実行
	 *
	 * @param options - Options
	 * @param options.reference - 脚注表示のトリガー要素
	 * @param options.footnote - 脚注を表示する要素
	 */
	async convert(
		options: Readonly<{
			reference: {
				element: string;
				id_prefix: string;
			};
			footnote: {
				id_prefix: string;
			};
		}>
	): Promise<void> {
		const referenceOptions = options.reference;
		const footnoteOptions = options.footnote;

		const referenceElements = this.document.querySelectorAll(referenceOptions.element);
		if (referenceElements.length === 0) {
			return;
		}

		const footnotes: string[] = [];
		await Promise.all(
			[...referenceElements].map(async (referenceElement, index) => {
				footnotes.push(referenceElement.innerHTML);

				/* EJS を解釈 */
				const referenceHtml = await this.renderEjsFile(
					{
						no: index + 1,
						idPrefix: referenceOptions.id_prefix,
						footnoteIdPrefix: footnoteOptions.id_prefix,
					},
					'footnote-reference'
				);
				this.replaceHtml(referenceElement, referenceHtml);
			})
		);

		if (footnotes.length >= 1) {
			/* EJS を解釈 */
			const footnoteHtml = await this.renderEjsFile({
				idPrefix: footnoteOptions.id_prefix,
				referenceIdPrefix: referenceOptions.id_prefix,
				foortnotes: footnotes,
			});

			this.document.body.insertAdjacentHTML('beforeend', footnoteHtml);
		}
	}
}
