import dayjs from 'dayjs';
import IsbnVerify from '@saekitominaga/isbn-verify';
import Html from './Html.js';

/**
 * 書籍
 *
 * <build-book
 *   heading-level="2"
 * >
 *   <book-name>書名</book-name>
 *   <book-release>2022-01-01</book-release>
 *   <book-isbn>978-4-06-377485-6</book-isbn>
 *   <book-amazon asin="B01GRDKGZW" image-id="510waYsj0oL" width="120" height="160"></book-amazon>
 *   <book-contents>
 *     <p>解説文</p>
 *   </book-contents>
 * </build-book>
 * ↓
 * <section class="p-library" itemscope="" itemtype="http://schema.org/Book">
 *   <header class="p-library__header">
 *     <h2 itemprop="name">書名</h2>
 *     <p class="p-library__release"><span class="htmlbuild-datetime" itemprop="datePublished">2022年1月1日</span>発売</p>
 *     <p class="p-library__isbn"><a href="https://iss.ndl.go.jp/books?search_mode=advanced;rft.isbn=978-4-06-377485-6" class="htmlbuild-host">ISBN: <span itemprop="isbn">978-4-06-377485-6</span></a></p>
 *   </header>
 *   <div class="p-library__main">
 *     <div class="p-embed-sidebar -embed-first">
 *       <div class="p-embed-sidebar__embed">
 *         <a href="https://www.amazon.co.jp/dp/B01GRDKGZW/" class="p-library__amazon htmlbuild-amazon-associate"><img src="https://m.media-amazon.com/images/I/510waYsj0oL._SL160_.jpg" srcset="https://m.media-amazon.com/images/I/510waYsj0oL._SL320_.jpg 2x" alt="" width="120" height="160" itemprop="image" />Amazon 商品ページ</a>
 *       </div>
 *       <div class="p-embed-sidebar__text">
 *         <p>解説文</p>
 *       </div>
 *     </div>
 *   </div>
 * </section>
 */
export default class HtmlBook extends Html {
	/**
	 * 変換実行
	 *
	 * @param {object} options - Options
	 * @param {string} options.target_element - Element name
	 * @param {string} buildHeadingAnchorClassName - 見出しセルフリンク用のビルドクラス名
	 */
	async convert(
		options: Readonly<{
			target_element: string;
		}>,
		buildHeadingAnchorClassName: string
	): Promise<void> {
		const targetElementName = options.target_element;

		await Promise.all(
			[...this.document.querySelectorAll(targetElementName)].map(async (targetElement) => {
				const nameElement = targetElement.querySelector('book-name');
				const releaseElement = targetElement.querySelector('book-release');
				const tagElements = targetElement.querySelectorAll('book-tag');
				const isbnElement = targetElement.querySelector('book-isbn');
				const amazonElement = targetElement.querySelector('book-amazon');
				const contentsElement = targetElement.querySelector('book-contents');

				const release = releaseElement?.textContent ?? undefined;
				let releaseDate: string | undefined = release;
				if (release !== undefined) {
					if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(release)) {
						releaseDate = dayjs(release).format('YYYY年M月D日');
					} else if (/^[0-9]{4}-[0-9]{2}$/.test(release)) {
						releaseDate = dayjs(release).format('YYYY年M月');
					} else if (/^[0-9]{4}$/.test(release)) {
						releaseDate = `${release}年`;
					} else {
						console.warn('不正な日付', release);
					}
				}

				const isbn = isbnElement?.textContent ?? undefined;
				if (isbn !== undefined && !new IsbnVerify(isbn, { strict: true }).isValid()) {
					console.warn('不正な ISBN', isbn);
				}

				const asin = amazonElement?.getAttribute('asin') ?? undefined;
				if (asin !== undefined && !/^[A-Z0-9]{10}$/.test(asin)) {
					console.warn('不正な ASIN', asin);
				}

				const amazonImageId = amazonElement?.getAttribute('image-id') ?? undefined;
				if (amazonImageId !== undefined && !/^[-+a-zA-Z0-9]{11}$/.test(amazonImageId)) {
					console.warn('不正な Amazon 画像 ID', amazonImageId);
				}

				const amazonImageWidth = amazonElement?.getAttribute('width') ?? undefined;
				if (amazonImageWidth !== undefined && !/^[1-9][0-9]|1[0-9]{2}$/.test(amazonImageWidth)) {
					console.warn('不正な Amazon 画像幅', amazonImageWidth);
				}

				const amazonImageHeight = amazonElement?.getAttribute('height') ?? undefined;
				if (amazonImageHeight !== undefined && !/^[1-9][0-9]|1[0-9]{2}$/.test(amazonImageHeight)) {
					console.warn('不正な Amazon 画像高さ', amazonImageHeight);
				}

				/* EJS を解釈 */
				const html = await this.renderEjsFile({
					buildHeadingAnchorClassName: buildHeadingAnchorClassName,
					headingLevel: targetElement.getAttribute('heading-level'),
					name: nameElement?.textContent,
					release: releaseDate,
					tags: Array.from(tagElements).map((element) => element.textContent),
					isbn: isbn,
					asin: asin,
					amazonImageId: amazonImageId,
					amazonImageWidth: amazonImageWidth,
					amazonImageHeight: amazonImageHeight,
					contents: contentsElement?.innerHTML,
				});

				this.replaceHtml(targetElement, html);
			})
		);
	}
}
