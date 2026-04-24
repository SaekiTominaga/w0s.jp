import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import ListOrder from './ListOrder.astro';

test('digit 1', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(ListOrder, {
		props: {
			label: 'label',
		},
		slots: {
			default: '<li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>',
		},
	});

	const root = parse(result);

	const ol = root.firstElementChild;

	expect(ol?.tagName.toLowerCase()).toBe('ol');
	expect(ol?.getAttribute('data-digit')).toBe('1');
});

test('digit 2', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(ListOrder, {
		props: {
			label: 'label',
		},
		slots: {
			default: '<li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>',
		},
	});

	const root = parse(result);

	const ol = root.firstElementChild;

	expect(ol?.tagName.toLowerCase()).toBe('ol');
	expect(ol?.getAttribute('data-digit')).toBe('2');
});
