import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { parse } from 'node-html-parser';
import { removeImageDefaultAttribute } from './image.ts';

await test('removeDefaultAttribute', async (t) => {
	await t.test('default values', () => {
		const root = parse(`<img src="iamge" alt="alt text" decoding="auto" loading="eager" fetchpriority="auto">`);

		removeImageDefaultAttribute(root);

		assert.equal(root.innerHTML, `<img src="iamge" alt="alt text">`);
	});

	await t.test('customized values', () => {
		const root = parse(`<img src="iamge" alt="alt text" decoding="async" loading="lazy" fetchpriority="high">`);

		removeImageDefaultAttribute(root);

		assert.equal(root.innerHTML, `<img src="iamge" alt="alt text" decoding="async" loading="lazy" fetchpriority="high">`);
	});
});
