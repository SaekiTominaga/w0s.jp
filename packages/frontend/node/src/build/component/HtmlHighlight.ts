import hljs from 'highlight.js/lib/core';
import hljsJavaScript from 'highlight.js/lib/languages/javascript';
import hljsXml from 'highlight.js/lib/languages/xml';
import Html from './Html.js';

/**
 * highlight.js
 *
 * <code class="build-highlight" data-language="xml">
 *   &lt;foo&gt;text&lt;/foo&gt;
 * </code>
 * ↓
 * <code data-language="xml">
 *   <span class="foo-tag">&lt;<span class="foo-name">foo</span>&gt;</span>text<span class="foo-tag">&lt;/<span class="foo-name">foo</span>&gt;</span>
 * </code>
 */
export default class HtmlHighlight extends Html {
	/**
	 * 変換実行
	 *
	 * @param options - Options
	 * @param options.target_class - Class name of the <img> element to process
	 */
	convert(
		options: Readonly<{
			target_class: string;
			class_prefix: string;
		}>,
	): void {
		const targetClassName = options.target_class;
		const optionsHightlight = {
			class_prefix: options.class_prefix,
		};

		hljs.registerLanguage('xml', hljsXml);
		hljs.registerLanguage('javascript', hljsJavaScript);
		hljs.configure({
			classPrefix: optionsHightlight.class_prefix,
		});

		this.document.querySelectorAll(`.${targetClassName}`).forEach((targetElement) => {
			Html.removeClassName(targetElement, targetClassName);

			const content = targetElement.textContent;
			if (content === null || content === '') {
				return;
			}

			const languageName = targetElement.getAttribute('data-language');
			let registLanguageName: string | undefined;
			switch (languageName) {
				case 'xml':
				case 'html':
				case 'svg': {
					registLanguageName = 'xml';
					break;
				}
				case 'javascript': {
					registLanguageName = 'javascript';
					break;
				}
				default: {
					console.warn('無効な言語名', languageName);
				}
			}

			const highlighted = registLanguageName !== undefined ? hljs.highlight(content, { language: registLanguageName }) : hljs.highlightAuto(content);

			targetElement.innerHTML = highlighted.value;
		});
	}
}
