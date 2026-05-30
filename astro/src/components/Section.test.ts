import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import GithubSlugger from 'github-slugger';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Section from './Section.astro';

const container = await AstroContainer.create();

test('base', async () => {
	const result = await container.renderToString(Section, {
		props: {
			slugger: new GithubSlugger(),
		},
		slots: {
			default: '<p>text</p>',
			heading: '<span>heading</span>',
		},
	});

	const root = parse(result);

	const section = root.querySelector('section');
	const h2 = root.querySelector('.hdg > h2');
	const h3 = root.querySelector('.hdg > h3');
	const h4 = root.querySelector('.hdg > h4');
	const h5 = root.querySelector('.hdg > h5');
	const selfLink = root.querySelector('.hdg > .self-link > a');

	expect(section?.getAttribute('autofocus')).toBeUndefined();
	expect(section?.getAttribute('tabindex')).toBeUndefined();
	expect(section?.classList.contains('section')).toBeTruthy();
	expect(section?.classList.contains('-a')).toBeTruthy();
	expect(section?.classList.contains('-box')).toBeFalsy();
	expect(section?.id).toBe('heading');
	expect(h2?.innerHTML).toBe('<span>heading</span>');
	expect(h3).toBeNull();
	expect(h4).toBeNull();
	expect(h5).toBeNull();
	expect(selfLink?.getAttribute('href')).toBe('#heading');
});

test('id', async () => {
	const result = await container.renderToString(Section, {
		props: {
			id: 'id',
		},
	});

	const root = parse(result);

	const section = root.querySelector('section');

	expect(section?.id).toBe('id');
});

test('depth', async () => {
	const result = await container.renderToString(Section, {
		props: {
			id: 'id',
			depth: 2,
		},
	});

	const root = parse(result);

	const section = root.querySelector('section');
	const h = root.querySelector('.hdg > h3');

	expect(section?.classList.contains('-a')).toBeFalsy();
	expect(section?.classList.contains('-b')).toBeTruthy();
	expect(h).not.toBeNull();
});

test('headingType', async () => {
	const result = await container.renderToString(Section, {
		props: {
			id: 'id',
			headingType: 'b',
		},
	});

	const root = parse(result);

	const section = root.querySelector('section');

	expect(section?.classList.contains('-a')).toBeFalsy();
	expect(section?.classList.contains('-b')).toBeTruthy();
});

test('box', async () => {
	const result = await container.renderToString(Section, {
		props: {
			id: 'id',
			box: true,
		},
	});

	const root = parse(result);

	const section = root.querySelector('section');

	expect(section?.classList.contains('-box')).toBeTruthy();
});

test('autofocus', async () => {
	const result = await container.renderToString(Section, {
		props: {
			id: 'id',
			autofocus: true,
		},
	});

	const root = parse(result);

	const section = root.querySelector('section');

	expect(section?.getAttribute('autofocus')).toBe('');
	expect(section?.getAttribute('tabindex')).toBe('-1');
});

test('class', async () => {
	const result = await container.renderToString(Section, {
		props: {
			id: 'id',
			class: 'foo',
		},
	});

	const root = parse(result);

	const section = root.querySelector('section');

	expect(section?.classList.contains('foo')).toBeTruthy();
});
