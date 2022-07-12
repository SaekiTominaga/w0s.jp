import HtmlComponent from '../../dist/build/component/Html.js';
import HtmlComponentAnchorAmazonAssociate from '../../dist/build/component/HtmlAnchorAmazonAssociate.js';
import HtmlComponentAnchorHost from '../../dist/build/component/HtmlAnchorHost.js';
import HtmlComponentAnchorType from '../../dist/build/component/HtmlAnchorType.js';
import HtmlComponentHighlight from '../../dist/build/component/HtmlHighlight.js';
import HtmlComponentImage from '../../dist/build/component/HtmlImage.js';
import HtmlComponentTimeJapaneseDate from '../../dist/build/component/HtmlTimeJapaneseDate.js';
import { describe, expect, test } from '@jest/globals';
import { JSDOM } from 'jsdom';

describe('replaceElement()', () => {
	test('クラス名のパターン', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
<span class="foo"></span>
</body></html>`
		);

		const document = dom.window.document;
		const htmlComponent = new HtmlComponent(document);

		for (const targetElement of document.querySelectorAll('span')) {
			htmlComponent.replaceElement(targetElement, 'foo');
		}

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<foo></foo>
<foo class="foo"></foo>
</body></html>`
		);
	});
});

describe('removeClassName()', () => {
	test('クラス名のパターン', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<span class="build-host"></span>
<span class="foo build-host	bar"></span>
</body></html>`
		);

		const document = dom.window.document;
		const htmlComponent = new HtmlComponent(document);

		for (const targetElement of document.querySelectorAll('.build-host')) {
			htmlComponent.removeClassName(targetElement, 'build-host');
		}

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<span></span>
<span class="foo bar"></span>
</body></html>`
		);
	});
});

describe('AnchorHost', () => {
	test('最小パラメーター', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<a href="https://example.com/" class="build-host">Link</a>
<a href="https://example.net/" class="build-host">Link</a>
</body></html>`
		);

		new HtmlComponentAnchorHost(dom.window.document).convert({
			target_class: 'build-host',
			insert_position: 'afterend',
			icon: [
				{
					host: 'example.com',
					name: 'Example',
					src: '/icon/com_example.svg',
				},
			],
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<a href="https://example.com/">Link</a><img src="/icon/com_example.svg" alt="Example">
<a href="https://example.net/">Link</a><span>example.net</span>
</body></html>`
		);
	});
	test('全パラメーター', () => {
		const dom = new JSDOM(
			`<!DOCTYPE html><html><head></head><body>
<a href="https://example.com/" class="build-host">Link</a>
<a href="https://example.net/" class="build-host">Link</a>
</body></html>`
		);

		new HtmlComponentAnchorHost(dom.window.document).convert({
			target_class: 'build-host',
			insert_position: 'afterend',
			parentheses: {
				before: '[',
				after: ']',
			},
			element: 'b',
			class: 'host',
			icon: [
				{
					host: 'example.com',
					name: 'Example',
					src: '/icon/com_example.svg',
				},
			],
			icon_size: 16,
			icon_class: 'icon',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<a href="https://example.com/">Link</a><img src="/icon/com_example.svg" alt="[Example]" width="16" height="16" class="icon">
<a href="https://example.net/">Link</a><b class="host">[example.net]</b>
</body></html>`
		);
	});
	test('href 属性なし', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a class="build-host">Link</a>
</body></html>`);

		new HtmlComponentAnchorHost(dom.window.document).convert({
			target_class: 'build-host',
			insert_position: 'afterend',
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a>Link</a>
</body></html>`);
	});
	test('相対パス', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="/" class="build-host">Link</a>
</body></html>`);

		new HtmlComponentAnchorHost(dom.window.document).convert({
			target_class: 'build-host',
			insert_position: 'afterend',
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a href="/">Link</a>
</body></html>`);
	});
});

describe('AnchorType', () => {
	test('最小パラメーター', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="/" type="application/pdf" class="build-type">Link</a>
<a href="/" type="image/png" class="build-type">Link</a>
</body></html>`);

		new HtmlComponentAnchorType(dom.window.document).convert({
			target_class: 'build-type',
			insert_position: 'afterend',
			icon: [
				{
					type: 'application/pdf',
					name: 'PDF',
					src: '/icon/pdf.svg',
				},
			],
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<a href="/" type="application/pdf">Link</a><img src="/icon/pdf.svg" alt="PDF">
<a href="/" type="image/png">Link</a>
</body></html>`
		);
	});
	test('全パラメーター', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="/" type="application/pdf" class="build-type">Link</a>
<a href="/" type="image/png" class="build-type">Link</a>
</body></html>`);

		new HtmlComponentAnchorType(dom.window.document).convert({
			target_class: 'build-type',
			insert_position: 'afterend',
			parentheses: {
				before: '[',
				after: ']',
			},
			icon: [
				{
					type: 'application/pdf',
					name: 'PDF',
					src: '/icon/pdf.svg',
				},
			],
			icon_size: 16,
			icon_class: 'type',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<a href="/" type="application/pdf">Link</a><img src="/icon/pdf.svg" alt="[PDF]" width="16" height="16" class="type">
<a href="/" type="image/png">Link</a>
</body></html>`
		);
	});
	test('href 属性なし', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a type="application/pdf" class="build-type">Link</a>
</body></html>`);

		new HtmlComponentAnchorType(dom.window.document).convert({
			target_class: 'build-type',
			insert_position: 'afterend',
			icon: [],
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a type="application/pdf">Link</a>
</body></html>`);
	});
	test('type 属性なし', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="/" class="build-type">Link</a>
</body></html>`);

		new HtmlComponentAnchorType(dom.window.document).convert({
			target_class: 'build-type',
			insert_position: 'afterend',
			icon: [],
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<a href="/">Link</a>
</body></html>`);
	});
});

describe('AnchorAmazonAssociate', () => {
	test('最小パラメーター', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a href="https://www.amazon.com/dp/B01GRDKGZW/" class="build-amazon">Link</a>
</body></html>`);

		new HtmlComponentAnchorAmazonAssociate(dom.window.document).convert({
			target_class: 'build-amazon',
			associate_id: 'xxx-20',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<a href="https://www.amazon.com/dp/B01GRDKGZW/ref=nosim?tag=xxx-20">Link</a>
</body></html>`
		);
	});
	test('href 属性なし', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<a class="build-amazon">Link</a>
</body></html>`);

		new HtmlComponentAnchorAmazonAssociate(dom.window.document).convert({
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

		new HtmlComponentAnchorAmazonAssociate(dom.window.document).convert({
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

		new HtmlComponentTimeJapaneseDate(dom.window.document).convert({
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
</body></html>`
		);
	});
	test('変換されないケース', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<span class="build-date"></span>
<span class="build-date">2022年123月2日</span>
<span class="build-date" datetime="2022-12-31">2022年1月2日</span>
</body></html>`);

		new HtmlComponentTimeJapaneseDate(dom.window.document).convert({
			target_class: 'build-date',
		});

		expect(dom.serialize()).toBe(`<!DOCTYPE html><html><head></head><body>
<span></span>
<span>2022年123月2日</span>
<span datetime="2022-12-31">2022年1月2日</span>
</body></html>`);
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

		new HtmlComponentImage(dom.window.document).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;quality=80, https://media.w0s.jp/thumbimage/foo?type=avif;quality=40 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;quality=80, https://media.w0s.jp/thumbimage/foo?type=webp;quality=40 2x"><img src="https://media.w0s.jp/thumbimage/foo"></picture>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;w=360;quality=80, https://media.w0s.jp/thumbimage/foo?type=avif;w=720;quality=40 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;w=360;quality=80, https://media.w0s.jp/thumbimage/foo?type=webp;w=720;quality=40 2x"><img src="https://media.w0s.jp/thumbimage/foo?w=360"></picture>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;h=360;quality=80, https://media.w0s.jp/thumbimage/foo?type=avif;h=720;quality=40 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;h=360;quality=80, https://media.w0s.jp/thumbimage/foo?type=webp;h=720;quality=40 2x"><img src="https://media.w0s.jp/thumbimage/foo?h=360"></picture>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;quality=100, https://media.w0s.jp/thumbimage/foo?type=avif;quality=50 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;quality=100, https://media.w0s.jp/thumbimage/foo?type=webp;quality=50 2x"><img src="https://media.w0s.jp/thumbimage/foo?quality=100"></picture>
<picture><source type="image/avif" srcset="https://media.w0s.jp/thumbimage/foo?type=avif;w=360;h=360;quality=100, https://media.w0s.jp/thumbimage/foo?type=avif;w=720;h=720;quality=50 2x"><source type="image/webp" srcset="https://media.w0s.jp/thumbimage/foo?type=webp;w=360;h=360;quality=100, https://media.w0s.jp/thumbimage/foo?type=webp;w=720;h=720;quality=50 2x"><img src="https://media.w0s.jp/thumbimage/foo?w=360;h=360;quality=100"></picture>
</body></html>`
		);
	});
	test('src 属性なし', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img class="build-image">
</body></html>`);

		new HtmlComponentImage(dom.window.document).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<img>
</body></html>`
		);
	});
	test('src 属性値が絶対パスではない', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img src="foo" class="build-image">
</body></html>`);

		new HtmlComponentImage(dom.window.document).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<img src="foo">
</body></html>`
		);
	});
	test('src 属性値の origin が異なる', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img src="https://image.example.com/" class="build-image">
</body></html>`);

		new HtmlComponentImage(dom.window.document).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<img src="https://image.example.com/">
</body></html>`
		);
	});
	test('src 属性値の pathname が異なる', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<img src="https://media.w0s.jp/foo" class="build-image">
</body></html>`);

		new HtmlComponentImage(dom.window.document).convert({
			target_class: 'build-image',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<img src="https://media.w0s.jp/foo">
</body></html>`
		);
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

		new HtmlComponentHighlight(dom.window.document).convert({
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
</body></html>`
		);
	});

	test('中身が空', () => {
		const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>
<code class="build-highlight" data-language="html"></code>
</body></html>`);

		new HtmlComponentHighlight(dom.window.document).convert({
			target_class: 'build-highlight',
			class_prefix: 'foo-',
		});

		expect(dom.serialize()).toBe(
			`<!DOCTYPE html><html><head></head><body>
<code data-language="html"></code>
</body></html>`
		);
	});
});
