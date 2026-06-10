import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Toc from './Toc.astro';

const container = await AstroContainer.create();

test('no heading', async () => {
	const result = await container.renderToString(Toc);

	const root = parse(result);

	const toc = root.querySelector('.toc');

	expect(toc).toBeNull();
});

test('one heading', async () => {
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

	const toc = root.querySelector('.toc');

	expect(toc).toBeNull();
});

test('base', async () => {
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

	const toc = root.querySelector('.toc');
	const heading = toc?.querySelector(':scope > h2');
	const items = toc?.querySelectorAll(':scope > ul > li');

	expect(toc).not.toBeNull();
	expect(toc?.classNames).toMatch(/toc astro-[a-z0-9]+/v);
	expect(heading?.textContent).toBe('目次');
	expect(items?.length).toBe(2);
	expect(items?.at(0)?.querySelector(':scope > a')?.getAttribute('href')).toBe('#%E8%A6%8B%E5%87%BA%E3%81%97ID1');
	expect(items?.at(1)?.querySelector(':scope > a')?.innerHTML).toBe('heading <code>text2</code>');
});

test('direction', async () => {
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

	const toc = root.querySelector('.toc');

	expect(toc?.classNames).toMatch(/toc -column astro-[a-z0-9]+/v);
});
