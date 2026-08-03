import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Date from './Date.astro';

describe('attribute', () => {
	test('minimum attributes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Date, {
			props: {
				value: '2000-01-02',
			},
		});

		const $root = parse(result);

		const $time = $root.querySelector('time');

		expect($time?.getAttribute('class')).toBeUndefined();
	});

	test('all attributes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Date, {
			props: {
				value: '2000-01-02',
				class: 'my-class',
			},
		});

		const $root = parse(result);

		const $time = $root.querySelector('time');

		expect($time?.getAttribute('datetime')).toBe('2000-01-02');
		expect($time?.getAttribute('class')).toBe('my-class');
		expect($time?.innerHTML).toBe('2000年1月2日');
	});
});

describe('format', () => {
	test('YYYY-MM-DD', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Date, {
			props: {
				value: '2000-01-02',
			},
		});

		const $root = parse(result);

		const $time = $root.querySelector('time');

		expect($time?.getAttribute('datetime')).toBe('2000-01-02');
		expect($time?.innerHTML).toBe('2000年1月2日');
	});

	test('YYYY-MM', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Date, {
			props: {
				value: '2000-01',
			},
		});

		const $root = parse(result);

		const $time = $root.querySelector('time');

		expect($time?.getAttribute('datetime')).toBe('2000-01');
		expect($time?.innerHTML).toBe('2000年1月');
	});

	test('YYYY', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Date, {
			props: {
				value: '2000',
			},
		});

		const $root = parse(result);

		const $time = $root.querySelector('time');

		expect($time?.getAttribute('datetime')).toBe('2000');
		expect($time?.innerHTML).toBe('2000年');
	});

	test('invalid', async () => {
		const container = await AstroContainer.create();

		await expect(
			container.renderToString(Date, {
				props: {
					value: '123',
				},
			}),
		).rejects.toThrow('Invalid date: `123`');
	});
});
