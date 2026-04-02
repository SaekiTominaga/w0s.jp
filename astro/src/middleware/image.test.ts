import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import * as cheerio from 'cheerio';
import { removeImageDefaultAttribute } from './image.ts';

await test('removeDefaultAttribute', async (t) => {
	await t.test('default values', () => {
		const $ = cheerio.load(`<img src="iamge" alt="alt text" decoding="auto" loading="eager" fetchpriority="auto">`);

		removeImageDefaultAttribute($);

		assert.equal($('body').html()?.trim(), `<img src="iamge" alt="alt text">`);
	});

	await t.test('customized values', () => {
		const $ = cheerio.load(`<img src="iamge" alt="alt text" decoding="async" loading="lazy" fetchpriority="high">`);

		removeImageDefaultAttribute($);

		assert.equal($('body').html()?.trim(), `<img src="iamge" alt="alt text" decoding="async" loading="lazy" fetchpriority="high">`);
	});
});
