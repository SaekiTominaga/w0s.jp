import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Title from './Title.astro';

test('base', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Title, {
		props: {
			title: 'title',
			subHeading: 'subHeading',
			dateModified: '2000-01-02',
		},
	});

	const root = parse(result);

	const h1 = root.querySelector('h1');
	const subHeading = root.querySelector('.sub-heading');
	const updated = root.querySelector('.updated');
	const updatedTime = root.querySelector('.updated > time');

	expect(h1?.innerHTML.trim().startsWith('title')).toBe(true);
	expect(subHeading?.innerHTML).toBe('（subHeading）');
	expect(updated?.textContent.trim()).toBe('2000年1月2日更新');
	expect(updatedTime?.getAttribute('datetime')).toBe('2000-01-02');
});

test('heading', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Title, {
		props: {
			title: 'title',
			heading: 'heading',
		},
	});

	const root = parse(result);

	const h1 = root.querySelector('h1');
	const subHeading = root.querySelector('.sub-heading');
	const updated = root.querySelector('.updated');
	const updatedTime = root.querySelector('.updated > time');

	expect(h1?.innerHTML.trim().startsWith('heading')).toBe(true);
	expect(subHeading).toBeNull();
	expect(updated).toBeNull();
	expect(updatedTime).toBeNull();
});
