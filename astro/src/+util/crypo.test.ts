import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getHTMLId } from './crypto.ts';

await test('getHTMLId', async (t) => {
	await t.test('radom', () => {
		assert.match(getHTMLId(), /[a-zA-Z0-9_\-]{22}/v);
	});

	await t.test('base text', () => {
		assert.equal(getHTMLId('text'), 'MWNiMjUxZWMwZDU2OGRlNmE5MjliNTIwYzRhZWQ4ZDE');
	});
});
