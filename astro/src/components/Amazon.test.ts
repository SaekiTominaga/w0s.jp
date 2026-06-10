import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Amazon from './Amazon.astro';

const container = await AstroContainer.create();

test('base', async () => {
	const result = await container.renderToString(Amazon, {
		props: {
			asin: 'asin1234',
			title: 'title',
			imageId: 'image1234',
			imageWidth: 100,
			imageHeight: 200,
		},
	});

	const root = parse(result);

	const a = root.querySelector('.item > a');
	const img = root.querySelector('.image');
	const title = root.querySelector('.title');
	const date = root.querySelector('.date');

	expect(a?.getAttribute('href')).toBe('https://www.amazon.co.jp/dp/asin1234/ref=nosim?tag=w0s.jp-22');
	expect(img?.getAttribute('src')).toBe('https://m.media-amazon.com/images/I/image1234._SL160_.jpg');
	expect(img?.getAttribute('srcset')).toBe('https://m.media-amazon.com/images/I/image1234._SL320_.jpg 2x');
	expect(img?.getAttribute('width')).toBe('100');
	expect(img?.getAttribute('height')).toBe('200');
	expect(title?.textContent).toBe('title');
	expect(date).toBeNull();
});

test('date', async () => {
	const result = await container.renderToString(Amazon, {
		props: {
			date: '2000-01-02',
		},
	});

	const root = parse(result);

	const date = root.querySelector('.date');

	expect(date?.textContent).toBe('2000年1月2日発売');
});
