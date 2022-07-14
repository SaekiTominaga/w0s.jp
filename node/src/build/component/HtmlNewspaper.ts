import dayjs from 'dayjs';
import ejs from 'ejs';
import Html from './Html.js';

/**
 * 新聞
 *
 * <build-newspaper
 *   name="誌名"
 *   release="2022-01-01"
 *   npclass="朝刊"
 * >
 *  <p>解説文</p>
 * </build-newspaper>
 * ↓
 * <section class="p-library" itemscope="" itemtype="http://schema.org/Newspaper">
 *   <header class="p-library__header">
 *     <h2 itemprop="name">誌名　<span class="htmlbuild-datetime" itemprop="datePublished">2022年1月1日</span>　朝刊</h2>
 *   </header>
 *   <div class="p-library__main">
 *     <p>解説文</p>
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
		buildHeadingAnchorClassName:string
	): void {
		const targetElementName = options.target_element;

		for (const targetElement of this.document.querySelectorAll(targetElementName)) {
			/* EJS を解釈 */
			const template = ejs.compile(`
<header class="p-library__header">
	<h<%= headingLevel %> class="p-library__title"><span itemprop="name"><%= name %><%_ if (release !== null) { _%>　<span class="htmlbuild-datetime" itemprop="datePublished"><%= release %></span><%_ } _%><%_ if (npclass !== null) { _%>　<%= npclass %><%_ } _%></span></h<%= headingLevel %>>
</header>
<div class="p-library__main">
<%- content %>
</div>
`);

			const release = targetElement.getAttribute('release');
			let releaseDate: string | null = release;
			if (release !== null) {
				if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(release)) {
					releaseDate = dayjs(release).format('YYYY年M月D日');
				} else {
					console.warn('不正な日付', release);
				}
			}

			const html = template({
				headingLevel: targetElement.getAttribute('heading-level'),
				name: targetElement.getAttribute('name'),
				release: releaseDate,
				npclass: targetElement.getAttribute('npclass'),
				content: targetElement.innerHTML,
			});

			const sectionElement = this.replaceHtml(targetElement, 'section', html);
			sectionElement.className = `p-library ${buildHeadingAnchorClassName}`;
			sectionElement.setAttribute('itemscope', '');
			sectionElement.setAttribute('itemtype', 'http://schema.org/Newspaper');
		}
	}
}
