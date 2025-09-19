import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getHTMLId } from './crypto.ts';

await test('getId', async (t) => {
	await t.test('radom', () => {
		assert.equal(/[a-zA-Z0-9_\-]{22}/v.test(getHTMLId()), true);
	});

	await t.test('base text', () => {
		assert.equal(getHTMLId('text'), 'MWNiMjUxZWMwZDU2OGRlNmE5MjliNTIwYzRhZWQ4ZDE');
	});
});
