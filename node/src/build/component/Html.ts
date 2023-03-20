import decamelize from 'decamelize';
import ejs from 'ejs';
import Log4js from 'log4js';

export default class Html {
	protected readonly logger: Log4js.Logger; // Logger

	protected readonly document: Document; // Document

	protected readonly views: string | undefined; // Views directory

	/**
	 * @param {object} document - Document
	 * @param {string} views - Views directory
	 */
	constructor(document: Document, views: string) {
		/* Logger */
		this.logger = Log4js.getLogger(this.constructor.name);

		/* Document */
		this.document = document;

		/* Views directory */
		this.views = views;
	}

	/**
	 * Replace existing element with new element
	 *
	 * @param {object} element - Target Element
	 * @param {string} newElementName - New element name
	 *
	 * @returns {object} New element
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
	 * @param {object} element - Target Element
	 * @param {string} newHtml - New HTML
	 *
	 * @returns {object} New element
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
	 * @param {object} element - Target Element
	 * @param {string} className - Class name
	 */
	protected static removeClassName(element: Element, className: string): void {
		element.classList.remove(className);
		if (element.classList.length === 0) {
			element.removeAttribute('class');
		}
	}

	/**
	 * HTML rendering using EJS file
	 *
	 * @param {object} data - EJS data
	 *
	 * @returns {string} - HTML
	 */
	protected async renderEjsFile(data?: ejs.Data): Promise<string> {
		const name = `${decamelize(this.constructor.name.replace(/^Html/, ''))}`; // HtmlFooBar.ts → foo-bar

		const html = await ejs.renderFile(`${this.views}/_${name}.ejs`, data);

		return html;
	}
}
