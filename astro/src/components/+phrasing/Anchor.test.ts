import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Anchor from './Anchor.astro';

const container = await AstroContainer.create();

test('internal', async () => {
	const result = await container.renderToString(Anchor, {
		props: {
			href: 'path/to',
		},
		slots: {
			default: 'text',
		},
	});

	const root = parse(result);

	const a = root.querySelector('a');
	const type = root.querySelector('.type');
	const domain = root.querySelector('.domain');

	expect(a?.textContent).toBe('text');
	expect(a?.getAttribute('href')).toBe('path/to');
	expect(a?.getAttribute('rel')).toBeUndefined();
	expect(a?.getAttribute('hreflang')).toBeUndefined();
	expect(a?.getAttribute('lang')).toBeUndefined();
	expect(a?.getAttribute('id')).toBeUndefined();
	expect(a?.getAttribute('aria-labelledby')).toBeUndefined();
	expect(a?.classList.contains('-bullet')).toBeFalsy();

	expect(type).toBeNull();

	expect(domain).toBeNull();
});

test('blog.w0s.jp', async () => {
	const result = await container.renderToString(Anchor, {
		props: {
			href: 'https://blog.w0s.jp/',
		},
		slots: {
			default: 'text',
		},
	});

	const root = parse(result);

	const a = root.querySelector('a');
	const type = root.querySelector('.type');
	const domain = root.querySelector('.domain');

	expect(a?.textContent).toBe('text');
	expect(a?.getAttribute('href')).toBe('https://blog.w0s.jp/');
	expect(a?.getAttribute('rel')).toBeUndefined();

	expect(type).toBeNull();

	expect(domain).toBeNull();
});

test('external', async () => {
	const result = await container.renderToString(Anchor, {
		props: {
			href: 'https://example.com/',
		},
		slots: {
			default: 'text',
		},
	});

	const root = parse(result);

	const a = root.querySelector('a');
	const type = root.querySelector('.type');
	const domain = root.querySelector('.domain');
	const domainCode = domain?.querySelector(':scope > code');

	expect(a?.textContent).toBe('text');
	expect(a?.getAttribute('href')).toBe('https://example.com/');
	expect(a?.getAttribute('rel')).toBe('external');

	expect(type).toBeNull();

	expect(domain?.textContent.trim()).toBe('(example.com)');
	expect(domainCode?.textContent).toBe('example.com');
});

test('Amazon', async () => {
	const result = await container.renderToString(Anchor, {
		props: {
			href: 'https://www.amazon.co.jp/dp/1234567890/',
		},
		slots: {
			default: 'text',
		},
	});

	const root = parse(result);

	const a = root.querySelector('a');
	const type = root.querySelector('.type');
	const domain = root.querySelector('.domain');
	const domainImage = domain?.querySelector(':scope > img');

	expect(a?.textContent).toBe('text');
	expect(a?.getAttribute('href')).toBe('https://www.amazon.co.jp/dp/1234567890/ref=nosim?tag=w0s.jp-22');
	expect(a?.getAttribute('rel')).toBe('external');

	expect(type).toBeNull();

	expect(domain).not.toBeNull();
	expect(domainImage?.getAttribute('src')).toBe('/assets/image/icon/amazon.png');
	expect(domainImage?.getAttribute('alt')).toBe('(Amazon)');
});

test('Type icon', async () => {
	const result = await container.renderToString(Anchor, {
		props: {
			href: 'https://example.com/',
			type: 'application/pdf',
		},
	});

	const root = parse(result);

	const type = root.querySelector('.type');
	const typeImage = type?.querySelector(':scope > img');

	expect(type).not.toBeNull();
	expect(typeImage?.getAttribute('src')).toBe('/assets/image/icon/pdf.png');
	expect(typeImage?.getAttribute('alt')).toBe('(PDF)');
});

describe('attribute', () => {
	test('hreflang', async () => {
		const result = await container.renderToString(Anchor, {
			props: {
				hreflang: 'en',
			},
		});

		const root = parse(result);

		const a = root.querySelector('a');

		expect(a?.getAttribute('hreflang')).toBe('en');
	});

	test('lang', async () => {
		const result = await container.renderToString(Anchor, {
			props: {
				lang: 'en',
			},
		});

		const root = parse(result);

		const a = root.querySelector('a');

		expect(a?.getAttribute('lang')).toBe('en');
	});

	test('id', async () => {
		const result = await container.renderToString(Anchor, {
			props: {
				id: 'foo',
			},
		});

		const root = parse(result);

		const a = root.querySelector('a');

		expect(a?.getAttribute('id')).toBe('foo');
	});

	test('aria-labelledby', async () => {
		const result = await container.renderToString(Anchor, {
			props: {
				'aria-labelledby': ['foo', 'bar'],
			},
		});

		const root = parse(result);

		const a = root.querySelector('a');

		expect(a?.getAttribute('aria-labelledby')).toBe('foo bar');
	});

	test('icon', async () => {
		const result = await container.renderToString(Anchor, {
			props: {
				href: 'https://example.com/',
				icon: false,
			},
		});

		const root = parse(result);

		const domain = root.querySelector('.domain');

		expect(domain).toBeNull();
	});

	test('bullet', async () => {
		const result = await container.renderToString(Anchor, {
			props: {
				bullet: true,
			},
		});

		const root = parse(result);

		const a = root.querySelector('a');

		expect(a?.classList.contains('-bullet')).toBeTruthy();
	});
});
