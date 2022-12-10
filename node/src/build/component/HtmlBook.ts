import dayjs from 'dayjs';
import ejs from 'ejs';
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
	convert(
		options: Readonly<{
			target_element: string;
		}>,
		buildHeadingAnchorClassName: string
	): void {
		const targetElementName = options.target_element;

		for (const targetElement of this.document.querySelectorAll(targetElementName)) {
			/* EJS を解釈 */
			const template = ejs.compile(`
<header class="p-library__header">
	<div class="p-library__title">
		<h<%= headingLevel %> itemprop="name"><%= name %></h<%= headingLevel %>>
	</div>
	<%_ if (release !== undefined) { _%>
		<p class="p-library__release"><span class="htmlbuild-datetime" itemprop="datePublished"><%= release %></span>発売</p>
	<%_ } _%>
	<%_ if (tags.length >= 1) { _%>
		<ul class="p-library__tags">
			<%_ for (tag of tags) { _%>
			<li><button type="button" class="js-library-tag" disabled=""><%= tag %></button></li>
			<%_ } _%>
		</ul>
	<%_ } _%>
	<%_ if (isbn !== undefined) { _%>
		<p class="p-library__isbn"><a href="https://iss.ndl.go.jp/books?search_mode=advanced;rft.isbn=<%= isbn %>" class="htmlbuild-host">ISBN: <span itemprop="isbn"><%= isbn %></span></a></p>
	<%_ } _%>
</header>
<div class="p-library__main">
	<%_ if (asin !== undefined) { _%>
		<div class="p-embed-sidebar -embed-first">
			<div class="p-embed-sidebar__embed">
				<div class="p-embed-link">
					<a href="https://www.amazon.co.jp/dp/<%= asin %>/" class="htmlbuild-amazon-associate">
						<%_ if (amazonImageId !== undefined && amazonImageWidth !== undefined && amazonImageHeight !== undefined) { _%>
						<img src="https://m.media-amazon.com/images/I/<%= amazonImageId %>._SL160_.jpg" srcset="https://m.media-amazon.com/images/I/<%= amazonImageId %>._SL320_.jpg 2x" alt="" width="<%= amazonImageWidth %>" height="<%= amazonImageHeight %>" itemprop="image" />
						<%_ } else { _%>
							<img src="/assets/image/amazon-noimage.svg" alt="" width="113" height="160" />
						<%_ } _%>
						<span class="p-embed-link__title">Amazon 商品ページ</span>
					</a>
				</div>
			</div>
			<div class="p-embed-sidebar__text"><%- contents %></div>
		</div>
	<%_ } else { _%><%- contents %><%_ } _%>
</div>
`);

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
					this.logger.warn('不正な日付', release);
				}
			}

			const html = template({
				headingLevel: targetElement.getAttribute('heading-level'),
				name: nameElement?.textContent,
				release: releaseDate,
				tags: Array.from(tagElements).map((element) => element.textContent),
				isbn: isbnElement?.textContent ?? undefined,
				asin: amazonElement?.getAttribute('asin') ?? undefined,
				amazonImageId: amazonElement?.getAttribute('image-id') ?? undefined,
				amazonImageWidth: amazonElement?.getAttribute('width') ?? undefined,
				amazonImageHeight: amazonElement?.getAttribute('height') ?? undefined,
				contents: contentsElement?.innerHTML,
			});

			const sectionElement = this.replaceHtml(targetElement, 'section', html);
			sectionElement.className = `p-library ${buildHeadingAnchorClassName}`;
			sectionElement.setAttribute('itemscope', '');
			sectionElement.setAttribute('itemtype', 'http://schema.org/Book');
		}
	}
}
