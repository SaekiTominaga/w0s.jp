import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { markdownRendar, yaml } from './feed.ts';

await test('markdown', async (t) => {
	const rendard = markdownRendar(`
text1[link1](/path/to/1)

text2[\`link2\`](/path/to/2)

text3[<cite>link3</cite>](/path/to/3)
`);

	await t.test('content', () => {
		assert.equal(
			rendard.html,
			`<p>text1<a href="/path/to/1">link1</a></p>
<p>text2<a href="/path/to/2"><code>link2</code></a></p>
<p>text3<a href="/path/to/3"><cite>link3</cite></a></p>`,
		);
	});

	await t.test('title', () => {
		assert.equal(rendard.title, 'text1link1 / text2link2 / text3link3');
	});

	await t.test('linkDestination', () => {
		assert.equal(rendard.linkDestinations.length, 3);
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
