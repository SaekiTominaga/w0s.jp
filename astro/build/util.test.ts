import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getPageUrl } from './util.ts';

await test('getPageUrl', async (t) => {
	await t.test('index', () => {
		assert.equal(getPageUrl('/index.html'), '/');
		assert.equal(getPageUrl('/foo/index.html'), '/foo/');
	});

	await t.test('Extension', () => {
		assert.equal(getPageUrl('/foo.html'), '/foo');
		assert.equal(getPageUrl('/foo.xhtml'), '/foo.xhtml');
	});

	await t.test('Windows path', () => {
		assert.equal(getPageUrl('\\foo\\bar.html'), '/foo/bar');
	});
});
