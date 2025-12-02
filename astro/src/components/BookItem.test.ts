import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, test } from 'vitest';
import BookItem from './BookItem.astro';

test('base', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(BookItem, {
		props: {
			sectionDepth: 1,
			title: 'title',
			summary: 'summary',
			link: 'foo',
		},
		slots: {
			details: '<p>details</p>',
			image: '<img>',
		},
	});

	const root = parse(result);

	const title = root.querySelector('.title');
	const summary = root.querySelector('.summary');
	const details = root.querySelector('.details');
	const link = root.querySelector('.link');
	const image = root.querySelector('.image');

	expect(title?.tagName).toBe('H2');
	expect(title?.querySelector('cite')?.textContent).toBe('title');
	expect(summary?.querySelector('b')?.textContent).toBe('summary');
	expect(details?.innerHTML.trim()).toBe('<p>details</p>');
	expect(link?.querySelector('a')?.textContent).toBe('紹介ページ');
	expect(image?.innerHTML.trim()).toBe('<img>');
});

describe('link', () => {
	test('Amazon', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BookItem, {
			props: {
				sectionDepth: 1,
				title: 'title',
				link: 'https://www.amazon.co.jp/dp/foo',
			},
		});

		expect(parse(result).querySelector('.link > a')?.textContent).toBe('Amazon 商品ページ');
	});

	test('Blog', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BookItem, {
			props: {
				sectionDepth: 1,
				title: 'title',
				link: 'https://blog.w0s.jp/entry/foo',
			},
		});

		expect(parse(result).querySelector('.link > a')?.textContent).toBe('告知記事');
	});
});
