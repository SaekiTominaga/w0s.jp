import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { getNoteData, getReferenceData } from './footnote.ts';

await test('getNoteData', async (t) => {
	const { document } = new JSDOM(`
<!DOCTYPE html>
<div id="template">
	<template class="astro-noteref -note" data-by="note1">
		<a><x-number></x-number></a>
	</template>
	<template class="astro-noteref -note" data-by="note2">
		<a><x-number></x-number></a>
	</template>
</div>

<p id="note1">note1 text</p>
<p id="note2">note2 text</p>
`).window;

	const noteData = getNoteData(document);

	await t.test('noteData', () => {
		assert.equal(noteData.size, 2);
		assert.equal(noteData.get(1), 'note1 text');
		assert.equal(noteData.get(2), 'note2 text');
	});

	await t.test('HTML', () => {
		assert.equal(
			document.querySelector('#template')?.innerHTML.trim(),
			'<a href="#fn-note1" id="nr-note1">1</a>\n\t\n\t\t<a href="#fn-note2" id="nr-note2">2</a>',
		);
	});
});

await test('getReferenceData', async (t) => {
	const { document } = new JSDOM(`
<!DOCTYPE html>
<div id="template">
	<template class="astro-noteref -ref" data-by="ref1">
		<a><x-number></x-number></a>
	</template>
	<template class="astro-noteref -ref" data-by="ref2">
		<a><x-number></x-number></a>
	</template>
</div>

<p id="ref1">ref1 text</p>
<p id="ref2">ref2 text</p>
`).window;

	const refData = getReferenceData(document);

	await t.test('refData', () => {
		assert.equal(refData.size, 2);
		assert.equal(refData.get(1), 'ref1 text');
		assert.equal(refData.get(2), 'ref2 text');
	});

	await t.test('HTML', () => {
		assert.equal(document.querySelector('#template')?.innerHTML.trim(), '<a href="#fn-ref1" id="nr-ref1">1</a>\n\t\n\t\t<a href="#fn-ref2" id="nr-ref2">2</a>');
	});
});

await test('no data-by', () => {
	const { document } = new JSDOM(`
<!DOCTYPE html>
<template class="astro-noteref -note"></template>
`).window;

	assert.throws(
		() => {
			getNoteData(document);
		},
		{
			name: 'Error',
			message: '`data-by` attribute is not set',
		},
	);
});

await test('no <a>', async (t) => {
	const { document } = new JSDOM(`
<div id="template">
	<template class="astro-noteref -note" data-by="note1">
		template text
	</template>
</div>

<p id="note1">note1 text</p>
`).window;

	const noteData = getNoteData(document);

	await t.test('noteData', () => {
		assert.equal(noteData.size, 1);
		assert.equal(noteData.get(1), 'note1 text');
	});

	await t.test('HTML', () => {
		assert.equal(document.querySelector('#template')?.innerHTML.trim(), 'template text');
	});
});
