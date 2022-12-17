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
	 * @param {string} options.trigger -
	 * @param {string} options.footnotes -
	 */
	convert(
		options: Readonly<{
			trigger: {
				element: string;
				class?: string;
				id_prefix: string;
				attributes?: {
					[key: string]: string;
				};
				parentheses_open?: string;
				parentheses_close?: string;
			};
			footnotes: {
				element: string;
				class?: string;
				no_class?: string;
				text_class?: string;
				id_prefix: string;
			};
		}>
	): void {
		const triggerOptions = options.trigger;
		const footnotesOptions = options.footnotes;

		const targetElements = this.document.querySelectorAll(triggerOptions.element);
		if (targetElements.length === 0) {
			return;
		}

		const foortnotes = new Set<Element>();
		targetElements.forEach((targetElement, index) => {
			foortnotes.add(targetElement);

			const no = index + 1;

			const footnoteTriggerReplacedElement = this.replaceHtml(targetElement, 'span');
			if (triggerOptions.class !== undefined) {
				footnoteTriggerReplacedElement.className = triggerOptions.class;
			}

			const aElement = this.document.createElement('a');
			aElement.href = `#${footnotesOptions.id_prefix}${no}`;
			aElement.id = `${triggerOptions.id_prefix}${no}`;
			if (triggerOptions.attributes !== undefined) {
				for (const [name, value] of Object.entries(triggerOptions.attributes)) {
					aElement.setAttribute(name, value);
				}
			}
			aElement.textContent = `${triggerOptions.parentheses_open ?? ''}${no}${triggerOptions.parentheses_close ?? ''}`;
			footnoteTriggerReplacedElement.appendChild(aElement);
		});

		const footnotesElement = this.document.querySelector(footnotesOptions.element);
		if (footnotesElement === null) {
			this.logger.error('注釈を表示する要素が未指定');
			return;
		}

		const footnotesReplacedElement = this.replaceHtml(footnotesElement, 'ul');
		if (footnotesOptions.class !== undefined) {
			footnotesReplacedElement.className = footnotesOptions.class;
		}

		Array.from(foortnotes).forEach((footnote, index) => {
			const no = index + 1;

			const liElement = this.document.createElement('li');
			footnotesReplacedElement.appendChild(liElement);

			const noElement = this.document.createElement('span');
			if (footnotesOptions.no_class !== undefined) {
				noElement.className = footnotesOptions.no_class;
			}
			liElement.appendChild(noElement);

			const aElement = this.document.createElement('a');
			aElement.href = `#${triggerOptions.id_prefix}${no}`;
			aElement.textContent = `${triggerOptions.parentheses_open ?? ''}${no}${triggerOptions.parentheses_close ?? ''}`;
			noElement.appendChild(aElement);

			const textElement = this.document.createElement('span');
			if (footnotesOptions.text_class !== undefined) {
				textElement.className = footnotesOptions.text_class;
			}
			textElement.id = `${footnotesOptions.id_prefix}${no}`;
			textElement.insertAdjacentHTML('afterbegin', footnote.innerHTML);
			liElement.appendChild(textElement);
		});
	}
}
