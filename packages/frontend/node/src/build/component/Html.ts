import decamelize from 'decamelize';
import ejs from 'ejs';

export default class Html {
	protected readonly document: Document; // Document

	protected readonly views: string | undefined; // Views directory

	/**
	 * @param document - Document
	 * @param views - Views directory
	 */
	constructor(document: Document, views: string) {
		/* Document */
		this.document = document;

		/* Views directory */
		this.views = views;
	}

	/**
	 * Replace existing element with new element
	 *
	 * @param element - Target Element
	 * @param newElementName - New element name
	 *
	 * @returns New element
	 */
	protected replaceElement(element: Element, newElementName: string): Element {
		const newElement = this.document.createElement(newElementName);

		for (const attribute of element.attributes) {
			newElement.setAttribute(attribute.name, attribute.value);
		}
		newElement.insertAdjacentHTML('afterbegin', element.innerHTML);

		element.parentNode?.replaceChild(newElement, element);

		return newElement;
	}

	/**
	 * Replace existing element with new HTML
	 *
	 * @param element - Target Element
	 * @param newHtml - New HTML
	 *
	 * @returns New element
	 */
	protected replaceHtml(element: Element, newHtml: string): Element {
		const newParentElement = this.document.createElement('div');
		newParentElement.insertAdjacentHTML('afterbegin', newHtml);

		const newParentElementChildren = newParentElement.children;
		if (newParentElementChildren.length > 1) {
			throw new Error('The HTML string to be replaced must have one parent element.');
		}

		const newElement = newParentElementChildren.item(0);
		if (newElement === null) {
			throw new Error('The HTML string to be replaced must have one element.');
		}

		element.replaceWith(newElement);

		return newElement;
	}

	/**
	 * Remove class name from element
	 *
	 * @param element - Target Element
	 * @param className - Class name
	 */
	protected static removeClassName(element: Element, className: string): void {
		element.classList.remove(className);
		if (element.classList.length === 0) {
			element.removeAttribute('class');
		}
	}

	/**
	 * Get EJS file path
	 *
	 * @param fileName - EJS file name
	 *
	 * @returns EJS file path
	 */
	protected getEjsPath(fileName?: string): string {
		const fixFileName = fileName === undefined ? `${decamelize(this.constructor.name.replace(/^Html/, ''), { separator: '-' })}` : fileName; // HtmlFooBar.ts → foo-bar

		return `${this.views}/${fixFileName}.ejs`;
	}

	/**
	 * HTML rendering using EJS file
	 *
	 * @param data - EJS data
	 * @param fileName - EJS file name
	 *
	 * @returns HTML
	 */
	protected async renderEjsFile(data: ejs.Data, fileName?: string): Promise<string> {
		const html = (await ejs.renderFile(this.getEjsPath(fileName), data)).trim();

		return html;
	}
}
