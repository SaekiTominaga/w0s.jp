import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Label from './Label.astro';

test('text', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Label, {
		props: {
			label: 'label',
		},
		slots: {
			default: '<input type="text">',
		},
	});

	const root = parse(result);

	const children = root.firstElementChild?.children;

	const label = children?.at(0);
	const ctrl = children?.at(1);

	expect(label?.tagName.toLowerCase()).toBe('span');
	expect(label?.textContent).toBe('label');
	expect(ctrl?.tagName.toLowerCase()).toBe('input');
	expect(ctrl?.getAttribute('type')).toBe('text');
});

test('checkbox', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Label, {
		props: {
			label: 'label',
		},
		slots: {
			default: '<input type="checkbox">',
		},
	});

	const root = parse(result);

	const children = root.firstElementChild?.children;

	const ctrl = children?.at(0);
	const label = children?.at(1);

	expect(ctrl?.tagName.toLowerCase()).toBe('input');
	expect(ctrl?.getAttribute('type')).toBe('checkbox');
	expect(label?.tagName.toLowerCase()).toBe('span');
	expect(label?.textContent).toBe('label');
});

test('radio', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Label, {
		props: {
			label: 'label',
		},
		slots: {
			default: '<input type="radio">',
		},
	});

	const root = parse(result);

	const children = root.firstElementChild?.children;

	const ctrl = children?.at(0);
	const label = children?.at(1);

	expect(ctrl?.tagName.toLowerCase()).toBe('input');
	expect(ctrl?.getAttribute('type')).toBe('radio');
	expect(label?.tagName.toLowerCase()).toBe('span');
	expect(label?.textContent).toBe('label');
});

test('switch', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Label, {
		props: {
			label: 'label',
		},
		slots: {
			default: '<w0s-input-switch></w0s-input-switch>',
		},
	});

	const root = parse(result);

	const children = root.firstElementChild?.children;

	const ctrl = children?.at(0);
	const label = children?.at(1);

	expect(ctrl?.tagName.toLowerCase()).toBe('w0s-input-switch');
	expect(label?.tagName.toLowerCase()).toBe('span');
	expect(label?.textContent).toBe('label');
});
