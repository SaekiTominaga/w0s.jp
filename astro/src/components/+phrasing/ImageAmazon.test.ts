import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import ImageAmazon from './ImageAmazon.astro';

describe('attribute', () => {
	test('minimum attributes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(ImageAmazon, {
			props: {
				src: 'https://m.media-amazon.com/images/I/71SGaIZ7TAL._SL160_.jpg',
				width: 100,
				height: 200,
			},
		});

		const $root = parse(result);

		const $img = $root.querySelector('img');

		expect($img?.getAttribute('alt')).toBe('');
		expect($img?.getAttribute('fetchpriority')).toBeUndefined();
		expect($img?.getAttribute('class')).toBeUndefined();
	});

	test('all attributes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(ImageAmazon, {
			props: {
				src: 'https://m.media-amazon.com/images/I/71SGaIZ7TAL._SL160_.jpg',
				alt: 'alt text',
				width: 100,
				height: 200,
				fetchPriority: 'high',
				class: 'my-class',
			},
		});

		const $root = parse(result);

		const $img = $root.querySelector('img');

		expect($img?.getAttribute('src')).toBe('https://m.media-amazon.com/images/I/71SGaIZ7TAL._SL160_.jpg');
		expect($img?.getAttribute('srcset')).toBe('https://m.media-amazon.com/images/I/71SGaIZ7TAL._SL320_.jpg 2x');
		expect($img?.getAttribute('alt')).toBe('alt text');
		expect($img?.getAttribute('width')).toBe('100');
		expect($img?.getAttribute('height')).toBe('200');
		expect($img?.getAttribute('fetchpriority')).toBe('high');
		expect($img?.getAttribute('class')).toBe('my-class');
	});
});

test('invalid URL', async () => {
	const container = await AstroContainer.create();

	await expect(
		container.renderToString(ImageAmazon, {
			props: {
				src: 'foo',
				width: 100,
				height: 200,
			},
		}),
	).rejects.toThrow('Invalid URL');
});

test('invalid Amazon URL', async () => {
	const container = await AstroContainer.create();

	await expect(
		container.renderToString(ImageAmazon, {
			props: {
				src: 'http://example.com',
				width: 100,
				height: 200,
			},
		}),
	).rejects.toThrow('The format of the URL does not seem to be that of an Amazon product image.');
});
