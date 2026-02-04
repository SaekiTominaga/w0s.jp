import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { markdown, yaml } from './feed.ts';

await test('markdown', async (t) => {
	const parsed = markdown(`
text[link1](/path/to/1)

text[link2](/path/to/2)
`);

	await t.test('content', () => {
		assert.equal(parsed.html, '<p>text<a href="/path/to/1">link1</a></p>\n<p>text<a href="/path/to/2">link2</a></p>');
	});

	await t.test('linkDestination', () => {
		assert.equal(parsed.linkDestinations.length, 2);
	});
});

await test('yaml', async (t) => {
	const entries = yaml(`
- id: '2026-01-01'
  updated: 2026-01-01
  content: |
    text1

- id: '2026-01-02'
  updated: 2026-01-02
  content: |
    text2
`);

	await t.test('length', () => {
		assert.equal(entries.length, 2);
	});

	await t.test('title', () => {
		assert.equal(entries.at(0)?.title, 'text1');
		assert.equal(entries.at(1)?.title, 'text2');
	});

	await t.test('unique', () => {
		assert.equal(/^[a-z0-9]{32}$/v.test(entries.at(0)!.unique), true);
		assert.equal(/^[a-z0-9]{32}$/v.test(entries.at(1)!.unique), true);
	});

	await t.test('updated', () => {
		assert.equal(entries.at(0)?.updated.format('YYYY-MM-DDTHH:mm:ssZ'), '2026-01-01T00:00:00+09:00');
		assert.equal(entries.at(1)?.updated.format('YYYY-MM-DDTHH:mm:ssZ'), '2026-01-02T00:00:00+09:00');
	});

	await t.test('links', () => {
		assert.equal(entries.at(0)?.links.length, 0);
		assert.equal(entries.at(1)?.links.length, 0);
	});

	await t.test('content', () => {
		assert.equal(entries.at(0)?.content, '<p>text1</p>');
		assert.equal(entries.at(1)?.content, '<p>text2</p>');
	});
});
