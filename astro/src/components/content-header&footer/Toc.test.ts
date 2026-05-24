import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Toc from './Toc.astro';

test('no heading', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Toc, {
		props: {
			data: [],
		},
	});

	const root = parse(result);

	const ul = root.querySelector('.toc');

	expect(ul).toBeNull();
});

test('one heading', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Toc, {
		props: {
			data: [
				{
					id: 'id',
					headingHtml: 'heading',
				},
			],
		},
	});

	const root = parse(result);

	const ul = root.querySelector('.toc');

	expect(ul).toBeNull();
});

test('base', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Toc, {
		props: {
			data: [
				{
					id: '見出しID1',
					headingHtml: 'heading <code>text1</code>',
				},
				{
					id: '見出しID2',
					headingHtml: 'heading <code>text2</code>',
				},
			],
		},
	});

	const root = parse(result);

	const ul = root.querySelector('.toc');
	const lis = ul?.querySelectorAll(':scope > li');

	expect(ul?.tagName).toBe('UL');
	expect(ul?.classNames).toBe('toc astro-sbrgumiv');
	expect(ul?.getAttribute('aria-label')).toBe('目次');
	expect(lis?.length).toBe(2);
	expect(lis?.at(0)?.querySelector(':scope > a')?.getAttribute('href')).toBe('#%E8%A6%8B%E5%87%BA%E3%81%97ID1');
	expect(lis?.at(1)?.querySelector(':scope > a')?.innerHTML).toBe('heading <code>text2</code>');
});

test('direction', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Toc, {
		props: {
			data: [
				{
					id: 'id1',
					headingHtml: 'heading1',
				},
				{
					id: 'id2',
					headingHtml: 'heading2',
				},
			],
			direction: 'column',
		},
	});

	const root = parse(result);

	const ul = root.querySelector('.toc');

	expect(ul?.classNames).toBe('toc -column astro-sbrgumiv');
});
