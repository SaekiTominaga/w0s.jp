import dayjs from 'dayjs';
import ejs from 'ejs';
import Html from './Html.js';

/**
 * 新聞
 *
 * <build-newspaper
 *   heading-level="2"
 *   name="誌名"
 *   release="2022-01-01"
 *   npclass="朝刊"
 * >
 *   <contents>
 *     <p>解説文</p>
 *   </contents>
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
export default class HtmlNewspaper extends Html {
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
	<h<%= headingLevel %> class="p-library__title"><span itemprop="name"><%= name %><%_ if (release !== undefined) { _%>　<span class="htmlbuild-datetime" itemprop="datePublished"><%= release %></span><%_ } _%><%_ if (npclass !== undefined) { _%>　<%= npclass %><%_ } _%></span></h<%= headingLevel %>>
</header>
<div class="p-library__main">
<%- contents %>
</div>
`);

			const nameElement = targetElement.querySelector('newspaper-name');
			const releaseElement = targetElement.querySelector('newspaper-release');
			const classElement = targetElement.querySelector('newspaper-class');
			const contentsElement = targetElement.querySelector('newspaper-contents');

			const release = releaseElement?.textContent ?? undefined;
			let releaseDate: string | undefined = release;
			if (release !== undefined) {
				if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(release)) {
					releaseDate = dayjs(release).format('YYYY年M月D日');
				} else {
					console.warn('不正な日付', release);
				}
			}

			const html = template({
				headingLevel: targetElement.getAttribute('heading-level'),
				name: nameElement?.textContent ?? undefined,
				release: releaseDate,
				npclass: classElement?.textContent ?? undefined,
				contents: contentsElement?.innerHTML,
			});

			const sectionElement = this.replaceHtml(targetElement, 'section', html);
			sectionElement.className = `p-library ${buildHeadingAnchorClassName}`;
			sectionElement.setAttribute('itemscope', '');
			sectionElement.setAttribute('itemtype', 'http://schema.org/Newspaper');
		}
	}
}
