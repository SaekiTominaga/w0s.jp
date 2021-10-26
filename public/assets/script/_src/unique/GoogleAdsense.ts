declare global {
	interface Window {
		adsbygoogle: any[];
	}
}

/**
 * Google AdSense
 */
export default class {
	#thisElement: HTMLElement;
	#SCRIPT_ID = 'script-adsbygoogle'; // 埋め込む <script> 要素の ID

	/**
	 * @param {HTMLElement} thisElement - 広告を表示する要素
	 */
	constructor(thisElement: HTMLElement) {
		this.#thisElement = thisElement;
	}

	connected(): void {
		if (window.IntersectionObserver === undefined) {
			/* Safari 11, iOS Safari 11-12.1 */
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					observer.disconnect();

					if (document.getElementById(this.#SCRIPT_ID) === null) {
						const scriptElement = document.createElement('script');
						scriptElement.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
						scriptElement.async = true;
						scriptElement.id = this.#SCRIPT_ID;
						document.head.append(scriptElement);
					}
					(window.adsbygoogle = window.adsbygoogle || []).push({});
				}
			},
			{
				rootMargin: '100px',
			}
		);

		observer.observe(this.#thisElement);
	}
}
