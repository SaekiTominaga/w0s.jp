import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getPageUrl } from './ssr.ts';

await test('getPageUrl', async (t) => {
	await t.test('normal page (dev)', () => {
		assert.equal(getPageUrl(new URL('http://example.com/path/to'), '/var/www/path/to.astro'), '/path/to');
	});

	await t.test('normal page (build)', () => {
		assert.equal(getPageUrl(new URL('http://example.com/path/to/'), '/var/www/path/to.astro'), '/path/to');
	});

	await t.test('index page', () => {
		assert.equal(getPageUrl(new URL('http://example.com/path/to/'), '/var/www/path/to/index.astro'), '/path/to/');
	});
});
