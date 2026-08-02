import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Lib from './Lib.astro';

describe('attribute', () => {
	test('minimum attributes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Lib, {
			props: {
				id: 'id',
				headingLevel: 1,
				title: 'title',
			},
			slots: {
				default: '<p>text</p>',
			},
		});

		const root = parse(result);

		const header = root.querySelector('.header');
		const main = root.querySelector('.main');

		const release = header?.querySelector('.release');
		const tags = header?.querySelector('.tags');
		const tagButtons = header?.querySelectorAll('.tags > .tag-button');
		const isbn = header?.querySelector('.isbn');

		expect(release).toBeNull();
		expect(tags).toBeNull();
		expect(tagButtons?.length).toBe(0);
		expect(isbn).toBeNull();

		expect(main?.innerHTML.trim()).toBe('<p>text</p>');
	});

	test('all attributes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Lib, {
			props: {
				id: 'id',
				headingLevel: 3,
				title: 'title',
				release: '2000-01-02',
				distribution: '2000-01-03',
				tags: ['foo', 'bar'],
				isbn: '978-4-06-519981-7',
				amazonAsin: 'foo123',
				amazonImageId: 'bar123',
				amazonImageWidth: 100,
				amazonImageHeight: 200,
			},
			slots: {
				default: '<p>text</p>',
			},
		});

		const root = parse(result);

		const section = root.querySelector('section');
		const header = root.querySelector('.header');
		const main = root.querySelector('.main');

		const heading = header?.querySelector('h3');
		const selfLink = header?.querySelector('.self-link');
		const release = header?.querySelectorAll('.release').at(0);
		const distribution = header?.querySelectorAll('.release').at(1);
		const tagButtons = header?.querySelectorAll('.tags > .tag-button');
		const isbn = header?.querySelector('.isbn');

		expect(section?.getAttribute('id')).toBe('id');
		expect(heading?.textContent).toBe('title');
		expect(selfLink?.innerHTML.trim()).toMatch(/^<a href="#id" class="astro-[a-z0-9]+">§<\/a>$/v);
		expect(release?.innerHTML.trim()).toMatch(/^<time datetime="2000-01-02" class="astro-[a-z0-9]+">2000年1月2日<\/time>発売$/v);
		expect(distribution?.innerHTML.trim()).toMatch(/^<time datetime="2000-01-03" class="astro-[a-z0-9]+">2000年1月3日<\/time>配布$/v);
		expect(tagButtons?.length).toBe(2);
		expect(tagButtons?.at(0)?.textContent.trim()).toBe('foo');
		expect(tagButtons?.at(0)?.getAttribute('disabled')).toBe('');
		expect(tagButtons?.at(1)?.textContent.trim()).toBe('bar');
		expect(tagButtons?.at(1)?.getAttribute('disabled')).toBe('');
		expect(isbn?.innerHTML.trim()).toMatch(
			/^<a href="https:\/\/ndlsearch\.ndl\.go\.jp\/search\?cs=bib&amp;f-isbn=978-4-06-519981-7" rel="external" class="astro-[a-z0-9]+">ISBN: <data value="978-4-06-519981-7" class="astro-[a-z0-9]+">978-4-06-519981-7<\/data><\/a>/v,
		);

		const embeddedSidebar = main?.querySelector('.embedded-sidebar');
		const embeddedSidebarEmbedded = embeddedSidebar?.querySelector(':scope > .embedded');
		const embeddedSidebarEmbeddedLink = embeddedSidebarEmbedded?.querySelector('a');
		const embeddedSidebarEmbeddedImage = embeddedSidebarEmbedded?.querySelector('img');
		const embeddedSidebarText = embeddedSidebar?.querySelector(':scope > .text');

		expect(embeddedSidebar).not.toBeNull();
		expect(embeddedSidebarEmbeddedLink?.getAttribute('href')).toBe('https://www.amazon.co.jp/dp/foo123/ref=nosim?tag=w0s.jp-22');
		expect(embeddedSidebarEmbeddedImage?.getAttribute('src')).toBe('https://m.media-amazon.com/images/I/bar123._SL160_.jpg');
		expect(embeddedSidebarEmbeddedImage?.getAttribute('alt')).toBe('表紙');
		expect(embeddedSidebarEmbeddedImage?.getAttribute('width')).toBe('100');
		expect(embeddedSidebarEmbeddedImage?.getAttribute('height')).toBe('200');
		expect(embeddedSidebarText?.innerHTML.trim()).toBe('<p>text</p>');
	});
});

describe('ISBN', () => {
	test('invalid', async () => {
		const container = await AstroContainer.create();

		await expect(
			container.renderToString(Lib, {
				props: {
					id: '',
					headingLevel: 1,
					title: '',
					isbn: '978-4-06-519981-0',
				},
			}),
		).rejects.toThrow('Invalid ISBN: `978-4-06-519981-0`');
	});
});

describe('Amazon', () => {
	test('no image', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Lib, {
			props: {
				id: 'id',
				headingLevel: 3,
				title: 'title',
				amazonAsin: 'foo123',
			},
			slots: {
				default: '<p>text</p>',
			},
		});

		const root = parse(result);

		const main = root.querySelector('.main');

		const embeddedSidebar = main?.querySelector('.embedded-sidebar');
		const embeddedSidebarEmbedded = embeddedSidebar?.querySelector(':scope > .embedded');
		const embeddedSidebarEmbeddedImage = embeddedSidebarEmbedded?.querySelector('img');

		expect(embeddedSidebarEmbeddedImage?.getAttribute('src')).toBe('/assets/image/amazon-noimage.svg');
		expect(embeddedSidebarEmbeddedImage?.getAttribute('alt')).toBe('表紙画像なし');
		expect(embeddedSidebarEmbeddedImage?.getAttribute('width')).toBe('113');
		expect(embeddedSidebarEmbeddedImage?.getAttribute('height')).toBe('160');
	});
});
