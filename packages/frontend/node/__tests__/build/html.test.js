import { describe, expect, test } from '@jest/globals';
import { JSDOM } from 'jsdom';
import HtmlComponent from '../../dist/build/component/Html.js';
import HtmlComponentAnchorAmazonAssociate from '../../dist/build/component/HtmlAnchorAmazonAssociate.js';
import HtmlComponentAnchorIcon from '../../dist/build/component/HtmlAnchorIcon.js';
import HtmlComponentBook from '../../dist/build/component/HtmlBook.js';
import HtmlComponentFootnote from '../../dist/build/component/HtmlFootnote.js';
import HtmlComponentHeadingSelfLink from '../../dist/build/component/HtmlHeadingSelfLink.js';
import HtmlComponentHighlight from '../../dist/build/component/HtmlHighlight.js';
import HtmlComponentImage from '../../dist/build/component/HtmlImage.js';
import HtmlComponentNewspaper from '../../dist/build/component/HtmlNewspaper.js';
import HtmlComponentSectioningId from '../../dist/build/component/HtmlSectioningId.js';
import HtmlComponentTimeJapaneseDate from '../../dist/build/component/HtmlTimeJapaneseDate.js';

const views = '../../views/_component';

describe('replaceElement()', () => {
	test('クラス名のパターン', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
<span class="foo"></span>
</body></html>`,
		);

		const { document } = dom.window;

		const html = new HtmlComponent(document, views);
		for (const targetElement of document.querySelectorAll('span')) {
			html.replaceElement(targetElement, 'foo');
		}

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<foo></foo>
<foo class="foo"></foo>
</body></html>`,
		);
	});
});

describe('replaceHtml()', () => {
	test('属性は削除される', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
<span class="foo"></span>
</body></html>`,
		);

		const { document } = dom.window;

		const html = new HtmlComponent(document, views);
		for (const targetElement of document.querySelectorAll('span')) {
			html.replaceHtml(targetElement, '<foo>');
		}

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<foo></foo>
<foo></foo>
</body></html>`,
		);
	});

	test('属性は置き換えられる', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
<span class="foo"></span>
</body></html>`,
		);

		const { document } = dom.window;

		const html = new HtmlComponent(document, views);
		for (const targetElement of document.querySelectorAll('span')) {
			html.replaceHtml(targetElement, '<foo class="foo">');
		}

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<foo class="foo"></foo>
<foo class="foo"></foo>
</body></html>`,
		);
	});

	test('第2引数に空文字', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
</body></html>`,
		);

		const { document } = dom.window;

		const html = new HtmlComponent(document, views);

		expect(() => {
			html.replaceHtml(document.querySelector('span'), '');
		}).toThrow('The HTML string to be replaced must have one element.');
	});

	test('第2引数に HTML として成立しない文字', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
</body></html>`,
		);

		const { document } = dom.window;

		const html = new HtmlComponent(document, views);

		expect(() => {
			html.replaceHtml(document.querySelector('span'), 'foo');
		}).toThrow('The HTML string to be replaced must have one element.');
	});

	test('第2引数に複数の要素', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
</body></html>`,
		);

		const { document } = dom.window;

		const html = new HtmlComponent(document, views);

		expect(() => {
			html.replaceHtml(document.querySelector('span'), '<foo></foo><bar></bar>');
		}).toThrow('The HTML string to be replaced must have one parent element.');
	});
});

describe('removeClassName()', () => {
	test('クラス名のパターン', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span class="build-host"></span>
<span class="foo build-host	bar"></span>
</body></html>`,
		);

		const { document } = dom.window;

		for (const targetElement of document.querySelectorAll('.build-host')) {
			HtmlComponent.removeClassName(targetElement, 'build-host');
		}

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
<span class="foo bar"></span>
</body></html>`,
		);
	});
});

describe('Book', () => {
	test('最小属性', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<build-book heading-level="2">
<book-name>書名</book-name>
<book-contents>
<p>解説文1</p>
<p>解説文2</p>
</book-contents>
</build-book>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentBook(document, views).convert(
			{
				target_element: 'build-book',
			},
			'build-heading-anchor',
		);

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>書名</h2>
		</div>
	</header>
	<div class="p-library__main">

<p>解説文1</p>
<p>解説文2</p>
	</div>
</section>
</body></html>`,
		);
	});

	test('全属性', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<build-book heading-level="2">
<book-name>書名</book-name>
<book-release>2022-01-01</book-release>
<book-tag>タグ1</book-tag>
<book-tag>タグ2</book-tag>
<book-isbn>978-4-06-377485-6</book-isbn>
<book-amazon asin="B01GRDKGZW" image-id="510waYsj0oL" width="120" height="160"></book-amazon>
<book-contents>
<p>解説文1</p>
<p>解説文2</p>
</book-contents>
</build-book>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentBook(document, views).convert(
			{
				target_element: 'build-book',
			},
			'build-heading-anchor',
		);

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>書名</h2>
		</div>
			<p class="p-library__release"><span class="htmlbuild-datetime">2022年1月1日</span>発売</p>
			<ul class="p-library__tags">
				<li><button type="button" class="js-library-tag" disabled="">タグ1</button></li>
				<li><button type="button" class="js-library-tag" disabled="">タグ2</button></li>
			</ul>
			<p class="p-library__isbn"><a href="https://iss.ndl.go.jp/books?search_mode=advanced;rft.isbn=978-4-06-377485-6" class="htmlbuild-host">ISBN: <data value="978-4-06-377485-6">978-4-06-377485-6</data></a></p>
	</header>
	<div class="p-library__main">
			<div class="p-embed-sidebar -embed-first">
				<div class="p-embed-sidebar__embed">
					<div class="p-embed-link">
						<a href="https://www.amazon.co.jp/dp/B01GRDKGZW/" class="htmlbuild-amazon-associate">
							<img src="https://m.media-amazon.com/images/I/510waYsj0oL._SL160_.jpg" srcset="https://m.media-amazon.com/images/I/510waYsj0oL._SL320_.jpg 2x" alt="" width="120" height="160">
							<span class="p-embed-link__title">Amazon 商品ページ</span>
						</a>
					</div>
				</div>
				<div class="p-embed-sidebar__text">
<p>解説文1</p>
<p>解説文2</p>
</div>
			</div>
	</div>
</section>
</body></html>`,
		);
	});

	test('日付パターン', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<build-book heading-level="2">
<book-name>書名</book-name>
<book-release>2022-01-01</book-release>
</build-book>
<build-book heading-level="2">
<book-name>書名</book-name>
<book-release>2022-01</book-release>
</build-book>
<build-book heading-level="2">
<book-name>書名</book-name>
<book-release>2022</book-release>
</build-book>
<build-book heading-level="2">
<book-release>xxxx</book-release>
<book-name>書名</book-name>
</build-book>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentBook(document, views).convert(
			{
				target_element: 'build-book',
			},
			'build-heading-anchor',
		);

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>書名</h2>
		</div>
			<p class="p-library__release"><span class="htmlbuild-datetime">2022年1月1日</span>発売</p>
	</header>
	<div class="p-library__main">
	</div>
</section>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>書名</h2>
		</div>
			<p class="p-library__release"><span class="htmlbuild-datetime">2022年1月</span>発売</p>
	</header>
	<div class="p-library__main">
	</div>
</section>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>書名</h2>
		</div>
			<p class="p-library__release"><span class="htmlbuild-datetime">2022年</span>発売</p>
	</header>
	<div class="p-library__main">
	</div>
</section>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>書名</h2>
		</div>
			<p class="p-library__release"><span class="htmlbuild-datetime">xxxx</span>発売</p>
	</header>
	<div class="p-library__main">
	</div>
</section>
</body></html>`,
		);
	});
});

describe('Newspaper', () => {
	test('最小属性', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<build-newspaper heading-level="2">
<newspaper-name>誌名</newspaper-name>
<newspaper-contents>
<p>解説文1</p>
<p>解説文2</p>
</newspaper-contents>
</build-newspaper>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentNewspaper(document, views).convert(
			{
				target_element: 'build-newspaper',
			},
			'build-heading-anchor',
		);

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>誌名</h2>
		</div>
	</header>
	<div class="p-library__main">

<p>解説文1</p>
<p>解説文2</p>

	</div>
</section>
</body></html>`,
		);
	});

	test('全属性', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<build-newspaper heading-level="2">
<newspaper-name>誌名</newspaper-name>
<newspaper-release>2022-01-01</newspaper-release>
<newspaper-class>朝刊</newspaper-class>
<newspaper-contents>
<p>解説文1</p>
<p>解説文2</p>
</newspaper-contents>
</build-newspaper>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentNewspaper(document, views).convert(
			{
				target_element: 'build-newspaper',
			},
			'build-heading-anchor',
		);

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>誌名　<span class="htmlbuild-datetime">2022年1月1日</span>　朝刊</h2>
		</div>
	</header>
	<div class="p-library__main">

<p>解説文1</p>
<p>解説文2</p>

	</div>
</section>
</body></html>`,
		);
	});

	test('日付パターン', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<build-newspaper heading-level="2">
<newspaper-name>誌名</newspaper-name>
<newspaper-release>2022-01-01</newspaper-release>
</build-newspaper>
<build-newspaper heading-level="2">
<newspaper-name>誌名</newspaper-name>
<newspaper-release>xxxx</newspaper-release>
</build-newspaper>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentNewspaper(document, views).convert(
			{
				target_element: 'build-newspaper',
			},
			'build-heading-anchor',
		);

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>誌名　<span class="htmlbuild-datetime">2022年1月1日</span></h2>
		</div>
	</header>
	<div class="p-library__main">

	</div>
</section>
<section class="p-library build-heading-anchor">
	<header class="p-library__header">
		<div class="p-library__title">
			<h2>誌名　<span class="htmlbuild-datetime">xxxx</span></h2>
		</div>
	</header>
	<div class="p-library__main">

	</div>
</section>
</body></html>`,
		);
	});
});

describe('SectionId', () => {
	test('ID自動付与', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<section>
<h2>Heading 1</h2>
</section>
<section id="hoge">
<h2>Heading 2</h2>
</section>
<section id="hoge">
<h2>Heading 3</h2>
</section>
<article>
<h2>hoge</h2>
</article>
<section>
</section>
<section>
<h2></h2>
</section>
<section>
<h2></h2>
</section>
</body></html>`,
		);

		const { document } = dom.window;

		new HtmlComponentSectioningId(document, views).convert({
			sectioning_area: document.body,
			heading_levels: [1, 2],
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<section id="heading-1">
<h2>Heading 1</h2>
</section>
<section id="hoge">
<h2>Heading 2</h2>
</section>
<section id="hoge">
<h2>Heading 3</h2>
</section>
<article id="hoge">
<h2>hoge</h2>
</article>
<section>
</section>
<section id="">
<h2></h2>
</section>
<section id="-1">
<h2></h2>
</section>
</body></html>`,
		);
	});

	test('sectionなし', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
</body></html>`,
		);

		const { document } = dom.window;

		new HtmlComponentSectioningId(document, views).convert({
			sectioning_area: document.body,
			heading_levels: [1, 2],
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
</body></html>`,
		);
	});
});

describe('AnchorIcon', () => {
	test('type', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="/" type="application/pdf" class="build-type">Link</a>
<a href="/" type="image/png" class="build-type">Link</a>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentAnchorIcon(document, views).convert({
			type: {
				target_class: 'build-type',
				icons: [
					{
						type: 'application/pdf',
						name: 'PDF',
						file_name: 'pdf.svg',
					},
				],
			},
			host: {
				target_class: 'build-host',
			},
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<a href="/" type="application/pdf">Link</a><img src="/assets/image/icon/pdf.svg" alt="(PDF)" width="16" height="16" class="c-link-icon">
<a href="/" type="image/png">Link</a>
</body></html>`,
		);
	});
	test('type; href 属性なし', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a type="application/pdf" class="build-type">Link</a>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentAnchorIcon(document, views).convert({
			type: {
				target_class: 'build-type',
				icons: [],
			},
			host: {
				target_class: 'build-host',
			},
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a type="application/pdf">Link</a>
</body></html>`);
	});
	test('type; type 属性なし', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="/" class="build-type">Link</a>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentAnchorIcon(document, views).convert({
			type: {
				target_class: 'build-type',
				icons: [],
			},
			host: {
				target_class: 'build-host',
			},
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a href="/">Link</a>
</body></html>`);
	});

	test('host', async () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<a href="https://example.com/" class="build-host">Link</a>
<a href="https://example.net/" class="build-host">Link</a>
</body></html>`,
		);

		const { document } = dom.window;

		await new HtmlComponentAnchorIcon(document, views).convert({
			type: {
				target_class: 'build-type',
				icons: [],
			},
			host: {
				target_class: 'build-host',
				icons: [
					{
						host: 'example.com',
						name: 'Example',
						file_name: 'com_example.svg',
					},
				],
			},
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<a href="https://example.com/">Link</a><img src="/assets/image/icon/com_example.svg" alt="(Example)" width="16" height="16" class="c-link-icon">
<a href="https://example.net/">Link</a><b class="c-domain">(example.net)</b>
</body></html>`,
		);
	});
	test('host; href 属性なし', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a class="build-host">Link</a>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentAnchorIcon(document, views).convert({
			type: {
				target_class: 'build-type',
				icons: [],
			},
			host: {
				target_class: 'build-host',
			},
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a>Link</a>
</body></html>`);
	});
	test('host; 相対パス', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="/" class="build-host">Link</a>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentAnchorIcon(document, views).convert({
			type: {
				target_class: 'build-type',
				icons: [],
			},
			host: {
				target_class: 'build-host',
			},
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a href="/">Link</a>
</body></html>`);
	});
});

describe('Footnote', () => {
	test('脚注', async () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<build-footnote-reference>脚注1</build-footnote-reference>
<build-footnote-reference>脚注2</build-footnote-reference>
</body></html>`,
		);

		const { document } = dom.window;

		await new HtmlComponentFootnote(document, views).convert({
			reference: {
				element: 'build-footnote-reference',
				id_prefix: 'fnref-',
			},
			footnote: {
				id_prefix: 'fn-',
			},
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<span class="c-footnote-ref"><a href="#fn-1" id="fnref-1" is="w0s-tooltip-trigger" data-tooltip-label="脚注" data-tooltip-class="p-tooltip" data-tooltip-close-text="閉じる" data-tooltip-close-image-src="/assets/image/tooltip-close.svg">[1]</a></span>
<span class="c-footnote-ref"><a href="#fn-2" id="fnref-2" is="w0s-tooltip-trigger" data-tooltip-label="脚注" data-tooltip-class="p-tooltip" data-tooltip-close-text="閉じる" data-tooltip-close-image-src="/assets/image/tooltip-close.svg">[2]</a></span>
<section class="p-footnote">
	<h2 class="p-footnote__hdg">脚注</h2>

	<ul class="p-footnote__list">
		<li>
			<span class="p-footnote__no">1.</span>
			<p class="p-footnote__content">
				<span id="fn-1">脚注1</span> <a href="#fnref-1" class="p-footnote__backref">↩ 戻る</a>
			</p>
		</li>
		<li>
			<span class="p-footnote__no">2.</span>
			<p class="p-footnote__content">
				<span id="fn-2">脚注2</span> <a href="#fnref-2" class="p-footnote__backref">↩ 戻る</a>
			</p>
		</li>
	</ul>
</section></body></html>`,
		);
	});
});

describe('HeadingSelfLink', () => {
	test('変換されるケース', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<section id="section-1" class="build-heading-anchor">
	<h2>Heading</h2>
</section>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentHeadingSelfLink(document, views).convert({
			target_class: 'build-heading-anchor',
			insert_position: 'beforeend',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<section id="section-1">
	<h2>Heading<p class="p-section__self-link"><a href="#section-1" class="c-self-link">§</a></p></h2>
</section>
</body></html>`,
		);
	});

	test('変換されないケース', async () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<section class="build-heading-anchor">
	<h2>IDなし</h2>
</section>
<section id="section-2" class="build-heading-anchor">
	<p>見出しなし</p>
</section>
</body></html>`);

		const { document } = dom.window;

		await new HtmlComponentHeadingSelfLink(document, views).convert({
			target_class: 'build-heading-anchor',
			insert_position: 'beforeend',
			anchor_class: 'self',
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<section>
	<h2>IDなし</h2>
</section>
<section id="section-2">
	<p>見出しなし</p>
</section>
</body></html>`);
	});
});

describe('AnchorAmazonAssociate', () => {
	test('最小パラメーター', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="https://www.amazon.com/dp/B01GRDKGZW/" class="build-amazon">Link</a>
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentAnchorAmazonAssociate(document, views).convert({
			target_class: 'build-amazon',
			associate_id: 'xxx-20',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<a href="https://www.amazon.com/dp/B01GRDKGZW/ref=nosim?tag=xxx-20">Link</a>
</body></html>`,
		);
	});
	test('href 属性なし', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a class="build-amazon">Link</a>
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentAnchorAmazonAssociate(document, views).convert({
			target_class: 'build-amazon',
			associate_id: 'xxx-20',
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a>Link</a>
</body></html>`);
	});
	test('変換されないケース', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="https://www.amazon.com/dp/B01GRDKGZW" class="build-amazon">URL 末尾にスラッシュ抜け</a>
<a href="https://www.amazon.com/dp/B01GRDKGZW/?tag=xxx-20" class="build-amazon">既にパラメーターがある</a>
<a href="https://www.amazon.com/xxx/B01GRDKGZW/" class="build-amazon">Amazon の商品ページではない</a>
<a href="/" class="build-amazon">相対パス</a>
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentAnchorAmazonAssociate(document, views).convert({
			target_class: 'build-amazon',
			associate_id: 'xxx-20',
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a href="https://www.amazon.com/dp/B01GRDKGZW">URL 末尾にスラッシュ抜け</a>
<a href="https://www.amazon.com/dp/B01GRDKGZW/?tag=xxx-20">既にパラメーターがある</a>
<a href="https://www.amazon.com/xxx/B01GRDKGZW/">Amazon の商品ページではない</a>
<a href="/">相対パス</a>
</body></html>`);
	});
});

describe('Highlight', () => {
	test('最小パラメーター', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<code class="build-highlight" data-language="xml">
&lt;foo&gt;text&lt;/foo&gt;
</code>
<code class="build-highlight" data-language="html">
&lt;em&gt;text&lt;/em&gt;
</code>
<code class="build-highlight" data-language="svg">
&lt;g&gt;text&lt;/g&gt;
</code>
<code class="build-highlight" data-language="javascript">
const foo = 'test';
</code>
<code class="build-highlight" data-language="xxx">
const foo = 'test';
</code>
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentHighlight(document, views).convert({
			target_class: 'build-highlight',
			class_prefix: 'foo-',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<code data-language="xml">
<span class="foo-tag">&lt;<span class="foo-name">foo</span>&gt;</span>text<span class="foo-tag">&lt;/<span class="foo-name">foo</span>&gt;</span>
</code>
<code data-language="html">
<span class="foo-tag">&lt;<span class="foo-name">em</span>&gt;</span>text<span class="foo-tag">&lt;/<span class="foo-name">em</span>&gt;</span>
</code>
<code data-language="svg">
<span class="foo-tag">&lt;<span class="foo-name">g</span>&gt;</span>text<span class="foo-tag">&lt;/<span class="foo-name">g</span>&gt;</span>
</code>
<code data-language="javascript">
<span class="foo-keyword">const</span> foo = <span class="foo-string">'test'</span>;
</code>
<code data-language="xxx">
<span class="foo-keyword">const</span> foo = <span class="foo-string">'test'</span>;
</code>
</body></html>`,
		);
	});

	test('中身が空', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<code class="build-highlight" data-language="html"></code>
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentHighlight(document, views).convert({
			target_class: 'build-highlight',
			class_prefix: 'foo-',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<code data-language="html"></code>
</body></html>`,
		);
	});
});

describe('Image', () => {
	test('最小パラメーター', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img src="https://media.w0s.jp/thumbimage/foo" class="build-image">
<img src="https://media.w0s.jp/thumbimage/foo?w=360" class="build-image">
<img src="https://media.w0s.jp/thumbimage/foo?h=360" class="build-image">
<img src="https://media.w0s.jp/thumbimage/foo?quality=100" class="build-image">
<img src="https://media.w0s.jp/thumbimage/foo?w=360;h=360;quality=100" class="build-image">
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentImage(document, views).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;quality=80, https://media.w0s.jp/thumbimage/foo?type=avif;quality=40 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;quality=80, https://media.w0s.jp/thumbimage/foo?type=webp;quality=40 2x"><img src="https://media.w0s.jp/thumbimage/foo"></picture>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;w=360;quality=80, https://media.w0s.jp/thumbimage/foo?type=avif;w=720;quality=40 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;w=360;quality=80, https://media.w0s.jp/thumbimage/foo?type=webp;w=720;quality=40 2x"><img src="https://media.w0s.jp/thumbimage/foo?w=360"></picture>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;h=360;quality=80, https://media.w0s.jp/thumbimage/foo?type=avif;h=720;quality=40 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;h=360;quality=80, https://media.w0s.jp/thumbimage/foo?type=webp;h=720;quality=40 2x"><img src="https://media.w0s.jp/thumbimage/foo?h=360"></picture>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;quality=100, https://media.w0s.jp/thumbimage/foo?type=avif;quality=50 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;quality=100, https://media.w0s.jp/thumbimage/foo?type=webp;quality=50 2x"><img src="https://media.w0s.jp/thumbimage/foo?quality=100"></picture>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;w=360;h=360;quality=100, https://media.w0s.jp/thumbimage/foo?type=avif;w=720;h=720;quality=50 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;w=360;h=360;quality=100, https://media.w0s.jp/thumbimage/foo?type=webp;w=720;h=720;quality=50 2x"><img src="https://media.w0s.jp/thumbimage/foo?w=360;h=360;quality=100"></picture>
</body></html>`,
		);
	});
	test('src 属性なし', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img class="build-image">
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentImage(document, views).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<img>
</body></html>`,
		);
	});
	test('src 属性値が絶対パスではない', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img src="foo" class="build-image">
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentImage(document, views).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<img src="foo">
</body></html>`,
		);
	});
	test('src 属性値の origin が異なる', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img src="https://image.example.com/" class="build-image">
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentImage(document, views).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<img src="https://image.example.com/">
</body></html>`,
		);
	});
	test('src 属性値の pathname が異なる', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img src="https://media.w0s.jp/foo" class="build-image">
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentImage(document, views).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<img src="https://media.w0s.jp/foo">
</body></html>`,
		);
	});
});

describe('TimeJapaneseDate', () => {
	test('最小パラメーター', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<span class="build-date" lang="ja"><b>2022年</b>1月2日</span>
<span class="build-date">2022年10月11日</span>
<span class="build-date"> 2022 年 1 月 2 日 </span>
<span class="build-date"> 2022 年 10 月 11 日 </span>
<span class="build-date">2022年1月</span>
<span class="build-date">2022年10月</span>
<span class="build-date"> 2022 年 1 月 </span>
<span class="build-date"> 2022 年 10 月 </span>
<span class="build-date">2022年</span>
<span class="build-date"> 2022 年 </span>
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentTimeJapaneseDate(document, views).convert({
			target_class: 'build-date',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<time lang="ja" datetime="2022-01-02"><b>2022年</b>1月2日</time>
<time datetime="2022-10-11">2022年10月11日</time>
<time datetime="2022-01-02"> 2022 年 1 月 2 日 </time>
<time datetime="2022-10-11"> 2022 年 10 月 11 日 </time>
<time datetime="2022-01">2022年1月</time>
<time datetime="2022-10">2022年10月</time>
<time datetime="2022-01"> 2022 年 1 月 </time>
<time datetime="2022-10"> 2022 年 10 月 </time>
<time datetime="2022">2022年</time>
<time datetime="2022"> 2022 年 </time>
</body></html>`,
		);
	});
	test('変換されないケース', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<span class="build-date"></span>
<span class="build-date">2022年123月2日</span>
<span class="build-date" datetime="2022-12-31">2022年1月2日</span>
</body></html>`);

		const { document } = dom.window;

		new HtmlComponentTimeJapaneseDate(document, views).convert({
			target_class: 'build-date',
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<span></span>
<span>2022年123月2日</span>
<span datetime="2022-12-31">2022年1月2日</span>
</body></html>`);
	});
});
