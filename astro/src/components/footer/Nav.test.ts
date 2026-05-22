import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Nav from './Nav.astro';

const container = await AstroContainer.create();

test('normal', async () => {
	const result = await container.renderToString(Nav, {
		props: {
			pagePath: 'path/to',
		},
	});

	const root = parse(result);

	const lis = root.querySelectorAll('.nav > li');
	const li1 = lis.at(0)?.querySelector(':scope > a');
	const li2 = lis.at(1)?.querySelector(':scope > a');
	const li3 = lis.at(2)?.querySelector(':scope > a');
	const li4 = lis.at(3)?.querySelector(':scope > a');

	expect(lis.length).toBe(4);

	expect(li1?.getAttribute('href')).toBe('/info');
	expect(li1?.getAttribute('rel')).toBeUndefined();
	expect(li1?.getAttribute('aria-current')).toBeUndefined();

	expect(li2?.getAttribute('href')).toBe('/privacy');
	expect(li2?.getAttribute('rel')).toBe('privacy-policy');
	expect(li2?.getAttribute('aria-current')).toBeUndefined();

	expect(li3?.getAttribute('href')).toBe('/technology');
	expect(li3?.getAttribute('rel')).toBeUndefined();
	expect(li3?.getAttribute('aria-current')).toBeUndefined();

	expect(li4?.getAttribute('href')).toBe('/contact');
	expect(li4?.getAttribute('rel')).toBeUndefined();
	expect(li4?.getAttribute('aria-current')).toBeUndefined();
});

test('current', async () => {
	const result = await container.renderToString(Nav, {
		props: {
			pagePath: '/privacy',
		},
	});

	const root = parse(result);

	const lis = root.querySelectorAll('.nav > li');
	const li1 = lis.at(0)?.querySelector(':scope > a');
	const li2 = lis.at(1)?.querySelector(':scope > a');

	expect(li1?.getAttribute('href')).toBe('/info');
	expect(li1?.getAttribute('rel')).toBeUndefined();
	expect(li1?.getAttribute('aria-current')).toBeUndefined();

	expect(li2?.getAttribute('href')).toBeUndefined();
	expect(li2?.getAttribute('rel')).toBeUndefined();
	expect(li2?.getAttribute('aria-current')).toBe('page');
});
