import Html from './Html.js';

/**
 * 日付文字列を `<time datetime>` 要素に変換
 *
 * <span class="build-date">2022年1月1日</span>
 * ↓
 * <time datetime="2022-01-01">2022年1月1日</time>
 */
export default class HtmlTimeJapaneseDate extends Html {
	/**
	 * 変換実行
	 *
	 * @param options - Options
	 * @param options.target_class - Class name of the element to process
	 */
	convert(
		options: Readonly<{
			target_class: string;
		}>,
	): void {
		const targetClassName = options.target_class;

		this.document.querySelectorAll(`.${targetClassName}`).forEach((targetElement) => {
			Html.removeClassName(targetElement, targetClassName);

			const content = targetElement.textContent;
			if (targetElement.getAttribute('datetime') !== null) {
				console.warn('`datetime` attribute already exists', content);
				return;
			}

			/* e.g. 2000年1月1日 */
			const patternMatchYMDgroups = content?.match(
				/^(?:[\s]*?)(?<year>\d{4})(?:[\s]*?)年(?:[\s]*?)(?<month>\d{1,2})(?:[\s]*?)月(?:[\s]*?)(?<day>\d{1,2})(?:[\s]*?)日(?:[\s]*?)$/,
			)?.groups;
			if (patternMatchYMDgroups !== undefined) {
				const timeElement = this.replaceElement(targetElement, 'time');
				timeElement.setAttribute(
					'datetime',
					`${patternMatchYMDgroups['year']}-${patternMatchYMDgroups['month']?.padStart(2, '0')}-${patternMatchYMDgroups['day']?.padStart(2, '0')}`,
				);
				return;
			}

			/* e.g. 2000年1月 */
			const patternMatchYMgroups = content?.match(/^(?:[\s]*?)(?<year>\d{4})(?:[\s]*?)年(?:[\s]*?)(?<month>\d{1,2})(?:[\s]*?)月(?:[\s]*?)$/)?.groups;
			if (patternMatchYMgroups !== undefined) {
				const timeElement = this.replaceElement(targetElement, 'time');
				timeElement.setAttribute('datetime', `${patternMatchYMgroups['year']}-${patternMatchYMgroups['month']?.padStart(2, '0')}`);
				return;
			}

			/* e.g. 2000年 */
			const patternMatchYgroups = content?.match(/^(?:[\s]*?)(?<year>\d{4})(?:[\s]*?)年(?:[\s]*?)$/)?.groups;
			if (patternMatchYgroups !== undefined) {
				const timeElement = this.replaceElement(targetElement, 'time');
				timeElement.setAttribute('datetime', `${patternMatchYgroups['year']}`);
				return;
			}

			console.warn('Does not match the specified Japanese date string format', content);
		});
	}
}
