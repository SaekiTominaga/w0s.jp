import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import AnchorIcon from './AnchorIcon.astro';

const container = await AstroContainer.create();

test('normal', async () => {
	const result = await container.renderToString(AnchorIcon, {
		props: {
			fileName: 'foo',
		},
	});

	const root = parse(result);

	const img = root.querySelector('img');

	expect(img?.getAttribute('src')).toBe('/assets/image/icon/foo');
	expect(img?.getAttribute('alt')).toBe('');
	expect(img?.getAttribute('width')).toBe('16');
	expect(img?.getAttribute('height')).toBe('16');
});

describe('attribute', () => {
	test('alt', async () => {
		const result = await container.renderToString(AnchorIcon, {
			props: {
				fileName: 'foo',
				alt: 'text',
			},
		});

		const root = parse(result);

		const img = root.querySelector('img');

		expect(img?.getAttribute('alt')).toBe('(text)');
	});
});
