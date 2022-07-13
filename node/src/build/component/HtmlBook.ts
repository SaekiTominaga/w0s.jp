import dayjs from 'dayjs';
import ejs from 'ejs';
import Html from './Html.js';

/**
 * 書籍
 *
 * <build-book
 *   name="書名"
 *   release="2022-01-01"
 *   isbn="978-4-06-377485-6"
 *   asin="B01GRDKGZW"
 *   amazon-image="510waYsj0oL"
 *   amazon-image-width="120"
 *   amazon-image-height="160"
 * >
 *  <p>解説文</p>
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
	 */
	convert(
		options: Readonly<{
			target_element: string;
		}>
	): void {
		const targetElementName = options.target_element;

		for (const targetElement of this.document.querySelectorAll(targetElementName)) {
			/* EJS を解釈 */
			const template = ejs.compile(`
<header class="p-library__header">
	<h2 itemprop="name"><%= name %></h2>
	<%_ if (release !== null) { _%>
		<p class="p-library__release"><span class="htmlbuild-datetime" itemprop="datePublished"><%= release %></span>発売</p>
	<%_ } _%>
	<%_ if (isbn !== null) { _%>
		<p class="p-library__isbn"><a href="https://iss.ndl.go.jp/books?search_mode=advanced;rft.isbn=<%= isbn %>" class="htmlbuild-host">ISBN: <span itemprop="isbn"><%= isbn %></span></a></p>
	<%_ } _%>
</header>
<div class="p-library__main">
	<%_ if (asin !== null && amazonImage !== null && amazonImageWidth !== null && amazonImageHeight !== null) { _%>
		<div class="p-embed-sidebar -embed-first">
			<div class="p-embed-sidebar__embed">
				<a href="https://www.amazon.co.jp/dp/<%= asin %>/" class="p-library__amazon htmlbuild-amazon-associate"><img src="https://m.media-amazon.com/images/I/<%= amazonImage %>._SL160_.jpg" srcset="https://m.media-amazon.com/images/I/<%= amazonImage %>._SL320_.jpg 2x" alt="" width="<%= amazonImageWidth %>" height="<%= amazonImageHeight %>" itemprop="image" />Amazon 商品ページ</a>
			</div>
			<div class="p-embed-sidebar__text"><%- content %></div>
		</div>
	<%_ } else { _%><%- content %><%_ } _%>
</div>
`);

			const release = targetElement.getAttribute('release');
			let releaseDate: string | null = release;
			if (release !== null) {
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

			const html = template({
				name: targetElement.getAttribute('name'),
				release: releaseDate,
				isbn: targetElement.getAttribute('isbn'),
				asin: targetElement.getAttribute('asin'),
				amazonImage: targetElement.getAttribute('amazon-image'),
				amazonImageWidth: targetElement.getAttribute('amazon-image-width'),
				amazonImageHeight: targetElement.getAttribute('amazon-image-height'),
				content: targetElement.innerHTML,
			});

			const sectionElement = this.replaceHtml(targetElement, 'section', html);
			sectionElement.className = 'p-library';
			sectionElement.setAttribute('itemscope', '');
			sectionElement.setAttribute('itemtype', 'http://schema.org/Book');
		}
	}
}
