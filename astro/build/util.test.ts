import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getPageUrl } from './util.ts';

await test('getPageUrl', async (t) => {
	await t.test('index', () => {
		assert.equal(getPageUrl('/index.html'), '/');
		assert.equal(getPageUrl('/foo/index.html'), '/foo/');
	});

	await t.test('extension', () => {
		assert.equal(getPageUrl('/foo.html'), '/foo');
		assert.equal(getPageUrl('/foo.xhtml'), '/foo.xhtml');
	});

	await t.test('Windows path', () => {
		assert.equal(getPageUrl('\\foo\\bar.html'), '/foo/bar');
	});

	await t.test('invalid path', () => {
		assert.throws(
			() => {
				getPageUrl('foo');
			},
			{ name: 'Error', message: 'The file path must begin with a slash.' },
		);
	});
});
