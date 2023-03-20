import Log4js from 'log4js';

export default class Html {
	protected readonly logger: Log4js.Logger; // Logger

	protected readonly document: Document; // Document

	/**
	 * @param {object} document - Document
	 */
	constructor(document: Document) {
		/* Logger */
		this.logger = Log4js.getLogger(this.constructor.name);

		/* Document */
		this.document = document;
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
}
