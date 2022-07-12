export default class Html {
	protected document: Document;

	constructor(document: Document) {
		this.document = document;
	}

	/**
	 * Remove class name from element
	 *
	 * @param {Element} element - Target Element
	 * @param {string} newName - New element name
	 */
	protected replaceElement(element: Element, newName: string): Element {
		const newElement = this.document.createElement(newName);

		for (const attribute of element.attributes) {
			newElement.setAttribute(attribute.name, attribute.value);
		}
		newElement.insertAdjacentHTML('afterbegin', element.innerHTML);

		element.parentNode?.replaceChild(newElement, element);

		return newElement;
	}

	/**
	 * Remove class name from element
	 *
	 * @param {Element} element - Target Element
	 * @param {string} className - Class name
	 */
	protected removeClassName(element: Element, className: string): void {
		element.classList.remove(className);
		if (element.classList.length === 0) {
			element.removeAttribute('class');
		}
	}
}
