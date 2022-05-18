import hljs from 'highlight.js/lib/core';
import hljsJavaScript from 'highlight.js/lib/languages/javascript';
import hljsXml from 'highlight.js/lib/languages/xml';
import URLSearchParamsCustomSeparator from '@saekitominaga/urlsearchparams-custom-separator';

export default class Convert {
	#document: Document;

	constructor(document: Document) {
		this.#document = document;
	}

	/**
	 * リンクアンカーにホスト情報を付与
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <a> element to process
	 * @param {string} options.insert_position - Host information insertion position
	 * @param {object} options.parentheses - Parentheses at site name (Used in `alt` attribute values)
	 * @param {string} options.parentheses.before - Opening parentheses
	 * @param {string} options.parentheses.after - Closing parentheses
	 * @param {string} options.element - Element name of the element displaying host information (If not specified, 'span')
	 * @param {string} options.class - Class name of the element displaying host information
	 * @param {object[]} options.icon - Icon infomation
	 * @param {number} options.icon_size - Icon size (Used in `width` and `height` attribute values)
	 * @param {string} options.icon_class - Class name of the `<img>` element displaying icon
	 */
	anchorHost(
		options: Readonly<{
			target_class: string;
			insert_position: InsertPosition;
			parentheses?: Readonly<{
				before?: string;
				after?: string;
			}>;
			element?: string;
			class?: string;
			icon?: Readonly<{
				host: string;
				name: string;
				src: string;
			}>[];
			icon_size?: number;
			icon_class?: string;
		}>
	): void {
		const targetClassName = options.target_class;
		const optionsHost = {
			insert_position: options.insert_position,
			parentheses: {
				before: options.parentheses?.before ?? '',
				after: options.parentheses?.after ?? '',
			},
			element: options.element ?? 'span',
			class: options.class,
			icon: options.icon,
			icon_size: options.icon_size,
			icon_class: options.icon_class,
		};

		for (const targetElement of this.#document.querySelectorAll(`.${targetClassName}`)) {
			this.#removeClassName(targetElement, targetClassName);

			const href = targetElement.getAttribute('href');
			if (href === null) {
				console.warn('No `href` attribute', targetElement.textContent);
				continue;
			}

			let url: URL;
			try {
				url = new URL(href);
			} catch {
				continue;
			}

			const hostIcon = optionsHost.icon?.find((icon) => icon.host === url.host);

			if (hostIcon !== undefined) {
				const iconElement = this.#document.createElement('img');
				iconElement.src = hostIcon.src;
				iconElement.alt = `${optionsHost.parentheses.before}${hostIcon.name}${optionsHost.parentheses.after}`;
				if (optionsHost.icon_size !== undefined) {
					iconElement.width = optionsHost.icon_size;
					iconElement.height = optionsHost.icon_size;
				}
				if (optionsHost.icon_class !== undefined) {
					iconElement.className = optionsHost.icon_class;
				}

				targetElement.insertAdjacentElement(optionsHost.insert_position, iconElement);
			} else {
				const hostElement = this.#document.createElement(optionsHost.element);
				if (optionsHost.class !== undefined) {
					hostElement.className = optionsHost.class;
				}
				hostElement.textContent = `${optionsHost.parentheses.before}${url.host}${optionsHost.parentheses.after}`;

				targetElement.insertAdjacentElement(optionsHost.insert_position, hostElement);
			}
		}
	}

	/**
	 * リンクアンカーにリソースタイプアイコンを付与
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <a> element to process
	 * @param {string} options.insert_position - Icon insertion position
	 * @param {object} options.parentheses - Parentheses at resource name (Used in `alt` attribute values)
	 * @param {string} options.parentheses.before - Opening parentheses
	 * @param {string} options.parentheses.after - Closing parentheses
	 * @param {object[]} options.icon - Icon infomation
	 * @param {number} options.icon_size - Icon size (Used in `width` and `height` attribute values)
	 * @param {string} options.icon_class - Class name of the `<img>` element displaying icon
	 */
	anchorType(
		options: Readonly<{
			target_class: string;
			insert_position: InsertPosition;
			parentheses?: Readonly<{
				before?: string;
				after?: string;
			}>;
			icon: Readonly<{
				type: string;
				name: string;
				src: string;
			}>[];
			icon_size?: number;
			icon_class?: string;
		}>
	): void {
		const targetClassName = options.target_class;
		const optionsIcon = {
			insert_position: options.insert_position,
			parentheses: {
				before: options.parentheses?.before ?? '',
				after: options.parentheses?.after ?? '',
			},
			icon: options.icon,
			icon_size: options.icon_size,
			icon_class: options.icon_class,
		};

		for (const targetElement of this.#document.querySelectorAll(`.${targetClassName}`)) {
			this.#removeClassName(targetElement, targetClassName);

			const type = targetElement.getAttribute('type');
			if (type !== null) {
				const typeIcon = optionsIcon.icon.find((icon) => icon.type === type);

				if (typeIcon !== undefined) {
					const iconElement = this.#document.createElement('img');
					iconElement.src = typeIcon.src;
					iconElement.alt = `${optionsIcon.parentheses?.before}${typeIcon.name}${optionsIcon.parentheses?.after}`;
					if (optionsIcon.icon_size !== undefined) {
						iconElement.width = optionsIcon.icon_size;
						iconElement.height = optionsIcon.icon_size;
					}
					if (optionsIcon.icon_class !== undefined) {
						iconElement.className = optionsIcon.icon_class;
					}

					targetElement.insertAdjacentElement(optionsIcon.insert_position, iconElement);
				}
			}
		}
	}

	/**
	 * Amazon 商品ページのリンクにアソシエイトタグを追加
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <a> element to process
	 * @param {string} options.associate_id - Associate ID
	 */
	anchorAmazonAssociate(
		options: Readonly<{
			target_class: string;
			associate_id: string;
		}>
	): void {
		const targetClassName = options.target_class;
		const optionsAssociate = {
			id: options.associate_id,
		};

		for (const targetElement of this.#document.querySelectorAll(`.${targetClassName}`)) {
			this.#removeClassName(targetElement, targetClassName);

			const href = targetElement.getAttribute('href');
			if (href === null) {
				console.warn('No `href` attribute', targetElement.textContent);
				continue;
			}

			if (!href.match(/^https:\/\/www\.amazon\.[a-z]+(\.[a-z]+)?\/dp\/([\dA-Z]{10})\/$/)) {
				console.warn('URL is not from Amazon product page', targetElement.textContent);
				continue;
			}

			targetElement.setAttribute('href', `${href}ref=nosim?tag=${optionsAssociate.id}`); // https://affiliate-program.amazon.com/help/node/topic/GP38PJ6EUR6PFBEC
		}
	}

	/**
	 * 日付文字列を `<time datetime>` 要素に変換
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the element to process
	 */
	timeJapaneseDate(
		options: Readonly<{
			target_class: string;
		}>
	): void {
		const targetClassName = options.target_class;

		for (const targetElement of this.#document.querySelectorAll(`.${targetClassName}`)) {
			this.#removeClassName(targetElement, targetClassName);

			const content = targetElement.textContent;
			if (targetElement.getAttribute('datetime') !== null) {
				console.warn('`datetime` attribute already exists', content);
				continue;
			}

			/* e.g. 2000年1月1日 */
			const patternMatchYMDgroups = content?.match(
				/^(?:[\s]*?)(?<year>\d{4})(?:[\s]*?)年(?:[\s]*?)(?<month>\d{1,2})(?:[\s]*?)月(?:[\s]*?)(?<day>\d{1,2})(?:[\s]*?)日(?:[\s]*?)$/
			)?.groups;
			if (patternMatchYMDgroups !== undefined) {
				const timeElement = this.#replaceElement(targetElement, 'time');
				timeElement.setAttribute(
					'datetime',
					`${patternMatchYMDgroups.year}-${patternMatchYMDgroups.month?.padStart(2, '0')}-${patternMatchYMDgroups.day?.padStart(2, '0')}`
				);
				continue;
			}

			/* e.g. 2000年1月 */
			const patternMatchYMgroups = content?.match(/^(?:[\s]*?)(?<year>\d{4})(?:[\s]*?)年(?:[\s]*?)(?<month>\d{1,2})(?:[\s]*?)月(?:[\s]*?)$/)?.groups;
			if (patternMatchYMgroups !== undefined) {
				const timeElement = this.#replaceElement(targetElement, 'time');
				timeElement.setAttribute('datetime', `${patternMatchYMgroups.year}-${patternMatchYMgroups.month?.padStart(2, '0')}`);
				continue;
			}

			/* e.g. 2000年 */
			const patternMatchYgroups = content?.match(/^(?:[\s]*?)(?<year>\d{4})(?:[\s]*?)年(?:[\s]*?)$/)?.groups;
			if (patternMatchYgroups !== undefined) {
				const timeElement = this.#replaceElement(targetElement, 'time');
				timeElement.setAttribute('datetime', `${patternMatchYgroups.year}`);
				continue;
			}

			console.warn('Does not match the specified Japanese date string format', content);
		}
	}

	/**
	 * `<picture>` 要素を使って複数フォーマットの画像を提供する
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <img> element to process
	 */
	image(
		options: Readonly<{
			target_class: string;
		}>
	): void {
		/**
		 * Assemble Url.search
		 *
		 * @param {string} type - Image type
		 * @param {number} width - Image width
		 * @param {number} height - Image Height
		 * @param {number} quality - Image quality
		 *
		 * @returns {string} URL.search
		 */
		const assembleUrlSearch = (type: string, width: number | null, height: number | null, quality: number): string => {
			let urlSearch = `?type=${type}`;

			if (width !== null) {
				urlSearch += `;w=${width}`;
			}
			if (height !== null) {
				urlSearch += `;h=${height}`;
			}
			urlSearch += `;quality=${quality}`;

			return urlSearch;
		};

		const targetClassName = options.target_class;

		for (const targetElement of this.#document.querySelectorAll(`.${targetClassName}`)) {
			this.#removeClassName(targetElement, targetClassName);

			const src = targetElement.getAttribute('src');
			if (src === null) {
				console.warn('No `src` attribute');
				continue;
			}

			let url: URL;
			try {
				url = new URL(src);
			} catch {
				console.warn('`src` attribute value is not a valid URL', src);
				continue;
			}

			if (url.origin !== 'https://media.w0s.jp') {
				console.warn('`src` attribute value is not a valid `media.w0s.jp` origin', src);
				continue;
			}
			if (!url.pathname.startsWith('/thumbimage/')) {
				console.warn('`src` attribute value is not a valid `media.w0s.jp` path', src);
				continue;
			}

			const urlSearchParamsCustomSeparator = new URLSearchParamsCustomSeparator(url.toString(), [';']);
			const urlSearchParams = urlSearchParamsCustomSeparator.getURLSearchParamsObject();

			const width = urlSearchParams.get('w') !== null ? Number(urlSearchParams.get('w')) : null;
			const height = urlSearchParams.get('h') !== null ? Number(urlSearchParams.get('h')) : null;
			const quality = urlSearchParams.get('quality') !== null ? Number(urlSearchParams.get('quality')) : 80;

			const originAndPath = `${url.origin}${url.pathname}`;
			const width1x = width;
			const width2x = width !== null ? width * 2 : null;
			const height1x = height;
			const height2x = height !== null ? height * 2 : null;
			const quality1x = quality;
			const quality2x = quality / 2;

			const pictureElement = this.#document.createElement('picture');

			const sourceAvifElement = this.#document.createElement('source');
			sourceAvifElement.type = 'image/avif';
			sourceAvifElement.srcset = `${originAndPath}${assembleUrlSearch('avif', width1x, height1x, quality1x)}, ${originAndPath}${assembleUrlSearch(
				'avif',
				width2x,
				height2x,
				quality2x
			)} 2x`;
			pictureElement.appendChild(sourceAvifElement);

			const sourceWebpElement = this.#document.createElement('source');
			sourceWebpElement.type = 'image/webp';
			sourceWebpElement.srcset = `${originAndPath}${assembleUrlSearch('webp', width1x, height1x, quality1x)}, ${originAndPath}${assembleUrlSearch(
				'webp',
				width2x,
				height2x,
				quality2x
			)} 2x`;
			pictureElement.appendChild(sourceWebpElement);

			pictureElement.appendChild(targetElement.cloneNode());

			targetElement.parentNode?.replaceChild(pictureElement, targetElement);
		}
	}

	/**
	 * highlight.js
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_class - Class name of the <img> element to process
	 */
	highlight(
		options: Readonly<{
			target_class: string;
			class_prefix: string;
		}>
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

		for (const targetElement of this.#document.querySelectorAll(`.${targetClassName}`)) {
			this.#removeClassName(targetElement, targetClassName);

			const content = targetElement.textContent;
			if (content === null) {
				continue;
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
		}
	}

	/**
	 * Remove class name from element
	 *
	 * @param {Element} element - Target Element
	 * @param {string} newName - New element name
	 */
	#replaceElement(element: Element, newName: string): Element {
		const newElement = this.#document.createElement(newName);

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
	#removeClassName(element: Element, className: string): void {
		element.classList.remove(className);
		if (element.classList.length === 0) {
			element.removeAttribute('class');
		}
	}
}
