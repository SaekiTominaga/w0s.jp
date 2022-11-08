export default class Html {
	protected document: Document;

	constructor(document: Document) {
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
	 * @param {string} newElementName - New element name
	 * @param {string} newInnerHtml - New inner HTML
	 *
	 * @returns {object} New element
	 */
	protected replaceHtml(element: Element, newElementName: string, newInnerHtml?: string): Element {
		const newElement = this.document.createElement(newElementName);
		if (newInnerHtml !== undefined) {
			newElement.insertAdjacentHTML('afterbegin', newInnerHtml);
		}

		element.parentNode?.replaceChild(newElement, element);

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
