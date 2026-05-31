import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Embedded from './Embedded.astro';

const container = await AstroContainer.create();

test('base', async () => {
	const result = await container.renderToString(Embedded, {
		props: {},
		slots: {},
	});

	const root = parse(result);

	const figure = root.querySelector('figure');
	const caption = root.querySelector('figcaption');

	expect(figure?.classList.contains('-border')).toBeFalsy();
	expect(figure?.getAttribute('data-width')).toBeUndefined();
	expect(figure?.getAttribute('style')).toBeUndefined();
	expect(caption).toBeNull();
});

test('caption', async () => {
	const result = await container.renderToString(Embedded, {
		props: {},
		slots: {
			caption: '<span>caption</span>',
		},
	});

	const root = parse(result);

	const caption = root.querySelector('figcaption');

	expect(caption?.classList.contains('-meta')).toBeFalsy();
	expect(caption?.innerHTML.trim()).toBe('<span>caption</span>');
});

test('width', async () => {
	const result = await container.renderToString(Embedded, {
		props: {
			width: 100,
		},
		slots: {},
	});

	const root = parse(result);

	const figure = root.querySelector('figure');

	expect(figure?.getAttribute('data-width')).toBe('100');
	expect(figure?.getAttribute('style')).toBe('--_width: 100px');
});

test('border', async () => {
	const result = await container.renderToString(Embedded, {
		props: {
			border: true,
		},
		slots: {},
	});

	const root = parse(result);

	const figure = root.querySelector('figure');

	expect(figure?.classList.contains('-border')).toBeTruthy();
});

test('captionMeta', async () => {
	const result = await container.renderToString(Embedded, {
		props: {
			captionMeta: true,
		},
		slots: {
			caption: 'caption',
		},
	});

	const root = parse(result);

	const caption = root.querySelector('figcaption');

	expect(caption?.classList.contains('-meta')).toBeTruthy();
});
