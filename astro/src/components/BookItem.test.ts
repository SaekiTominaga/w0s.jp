import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
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
	expect(image?.innerHTML).toBe('<img>');
});

test('heading - h3', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(BookItem, {
		props: {
			sectionDepth: 2,
			title: 'title',
			link: 'foo',
		},
	});

	expect(parse(result).querySelector('.title')?.tagName).toBe('H3');
});

test('heading - h4', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(BookItem, {
		props: {
			sectionDepth: 3,
			title: 'title',
			link: 'foo',
		},
	});

	expect(parse(result).querySelector('.title')?.tagName).toBe('H4');
});

test('heading - h5', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(BookItem, {
		props: {
			sectionDepth: 4,
			title: 'title',
			link: 'foo',
		},
	});

	expect(parse(result).querySelector('.title')?.tagName).toBe('H5');
});

test('heading - h6', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(BookItem, {
		props: {
			sectionDepth: 5,
			title: 'title',
			link: 'foo',
		},
	});

	expect(parse(result).querySelector('.title')?.tagName).toBe('H6');
});

test('heading - invalid', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(BookItem, {
		props: {
			sectionDepth: 6,
			title: 'title',
			link: 'foo',
		},
	});

	expect(parse(result).querySelector('.title')?.tagName).toBeUndefined();
});

test('link - Amazon', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(BookItem, {
		props: {
			sectionDepth: 1,
			title: 'title',
			link: 'https://www.amazon.co.jp/dp/',
		},
	});

	expect(parse(result).querySelector('.link > a')?.textContent).toBe('Amazon 商品ページ');
});

test('link - Blog', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(BookItem, {
		props: {
			sectionDepth: 1,
			title: 'title',
			link: 'https://blog.w0s.jp/entry/',
		},
	});

	expect(parse(result).querySelector('.link > a')?.textContent).toBe('告知記事');
});
