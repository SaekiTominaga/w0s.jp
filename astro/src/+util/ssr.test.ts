import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getPageUrl } from './ssr.ts';

await test('getPageUrl', async (t) => {
	await t.test('normal page', async (t2) => {
		await t2.test('dev', () => {
			assert.equal(getPageUrl(new URL('http://example.com/path/to'), '/var/www/path/to.astro'), '/path/to');
		});

		await t2.test('build', () => {
			assert.equal(getPageUrl(new URL('http://example.com/path/to/'), '/var/www/path/to.astro'), '/path/to');
		});
	});

	await t.test('index page', async (t2) => {
		await t2.test('dev', () => {
			assert.equal(getPageUrl(new URL('http://example.com/path/to'), '/var/www/path/to/index.astro'), '/path/to/');
		});

		await t2.test('build', () => {
			assert.equal(getPageUrl(new URL('http://example.com/path/to/'), '/var/www/path/to/index.astro'), '/path/to/');
		});
	});
});
