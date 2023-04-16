import Html from './Html.js';

/**
 * 注釈
 *
 * <build-footnote>注釈<em>強調</em>注釈</build-footnote>
 * <build-footnote>注釈<em>強調</em>注釈</build-footnote>
 *
 * <build-footnotes></build-footnotes>
 * ↓
 * <span class="c-annotate"><a href="#fn1" id="r1" is="w0s-tooltip-trigger">[1]</a></span>
 * <span class="c-annotate"><a href="#fn2" id="r2" is="w0s-tooltip-trigger">[2]</a></span>
 *
 * <ul class="p-footnotes">
 *   <li>
 *     <span class="p-footnotes__no"><a href="#r1">[1]</a></span>
 *     <span class="p-footnotes__text" id="fn1">注釈<em>強調</em>注釈</span>
 *   </li>
 *   <li>
 *     <span class="p-footnotes__no"><a href="#r2">[2]</a></span>
 *     <span class="p-footnotes__text" id="fn2">注釈<em>強調</em>注釈</span>
 *   </li>
 * </ul>
 */
export default class HtmlFootnote extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {object} options.trigger - 注釈表示のトリガー要素
	 * @param {object} options.footnotes - 注釈を表示する要素
	 */
	async convert(
		options: Readonly<{
			trigger: {
				element: string;
				id_prefix: string;
			};
			footnote: {
				element: string;
				id_prefix: string;
			};
		}>
	): Promise<void> {
		const triggerOptions = options.trigger;
		const footnotesOptions = options.footnote;

		const triggerElements = this.document.querySelectorAll(triggerOptions.element);
		if (triggerElements.length === 0) {
			return;
		}

		const foortnotes: string[] = [];
		await Promise.all(
			[...triggerElements].map(async (triggerElement, index) => {
				foortnotes.push(triggerElement.innerHTML);

				/* EJS を解釈 */
				const triggerHtml = await this.renderEjsFile(
					{
						no: index + 1,
						idPrefix: triggerOptions.id_prefix,
						footnoteIdPrefix: footnotesOptions.id_prefix,
					},
					'footnote-trigger'
				);
				this.replaceHtml(triggerElement, triggerHtml);
			})
		);

		const footnoteElement = this.document.querySelector(footnotesOptions.element);
		if (footnoteElement === null) {
			this.logger.error('注釈を表示する要素が未指定');
			return;
		}

		/* EJS を解釈 */
		const footnoteHtml = await this.renderEjsFile({
			idPrefix: footnotesOptions.id_prefix,
			triggerIdPrefix: triggerOptions.id_prefix,
			foortnotes: foortnotes,
		});
		this.replaceHtml(footnoteElement, footnoteHtml);
	}
}
