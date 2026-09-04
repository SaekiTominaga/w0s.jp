import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import LocalNav from './LocalNav.astro';

test('no data', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(LocalNav, {
		props: {
			pagePath: 'path/to',
		},
	});

	const $root = parse(result);

	const $nav = $root.querySelector('nav');

	expect($nav).toBeNull();
});

test('base', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(LocalNav, {
		props: {
			data: {
				label: 'label',
				items: [
					{
						path: 'path/to1',
						name: 'page1',
					},
					{
						path: 'path/to2',
						name: 'page2',
					},
				],
			},
			pagePath: 'path/to',
		},
	});

	const $root = parse(result);

	const $nav = $root.querySelector('nav');
	const $$li = $nav?.querySelectorAll('li');
	const $item1Anchor = $$li?.at(0)?.querySelector('a');
	const $item2Anchor = $$li?.at(1)?.querySelector('a');

	expect($nav?.getAttribute('aria-label')).toBe('label');
	expect($$li?.length).toBe(2);
	expect($item1Anchor?.getAttribute('href')).toBe('path/to1');
	expect($item1Anchor?.textContent).toBe('page1');
	expect($item2Anchor?.getAttribute('href')).toBe('path/to2');
	expect($item2Anchor?.textContent).toBe('page2');
});

test('self link', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(LocalNav, {
		props: {
			data: {
				label: 'label',
				items: [
					{
						path: 'path/to',
						name: 'page1',
					},
				],
			},
			pagePath: 'path/to',
		},
	});

	const $root = parse(result);

	const $item1Anchor = $root.querySelector('li:first-child > a');

	expect($item1Anchor?.getAttribute('href')).toBeUndefined();
});
