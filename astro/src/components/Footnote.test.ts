import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Footnote from './Footnote.astro';

const container = await AstroContainer.create();

test('normal', async () => {
	const result = await container.renderToString(Footnote, {
		props: {
			heading: 'heading',
			data: new Map<number, string | undefined>([
				[1, 'one'],
				[2, 'two'],
				[3, 'three<em>em</em>'],
			]),
			prefix: 'prefix',
			refPrefix: 'refprefix',
		},
	});

	const root = parse(result);

	const footnote = root.querySelector('.footnote');
	const heading = root.querySelector('.hdg');
	const listItems = root.querySelectorAll('.list > li');

	expect(footnote).not.toBeNull();
	expect(heading?.textContent).toBe('heading');
	expect(listItems.length).toBe(3);
	expect(listItems.at(0)?.querySelector('.no')?.textContent.trim()).toBe('1.');
	expect(listItems.at(1)?.querySelector('.content')?.id).toBe('prefix2');
	expect(listItems.at(2)?.querySelector('.content > p')?.innerHTML.trim()).toMatch(
		/three<em>em<\/em>\n\t+<a href="#refprefix3" class="backref astro-[a-z0-9]+" data-astro-source-file=".+" data-astro-source-loc="[0-9]{2}:[0-9]{2}">\n\t+↩ 戻る\n\t+<\/a>/v,
	);
});

test('no data', async () => {
	const result = await container.renderToString(Footnote, {
		props: {
			heading: '',
			data: new Map<number, string | undefined>(),
			prefix: '',
			refPrefix: '',
		},
	});

	const root = parse(result);

	const footnote = root.querySelector('.footnote');

	expect(footnote).toBeNull();
});
