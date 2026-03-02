import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { getData } from './toc.ts';

await test('getData', async (t) => {
	await t.test('HTML structure', () => {
		const { window } = new JSDOM(`
<!DOCTYPE html>
<section>
	<h2>heading1</h2>
</section>

<section id="heading2">
	<h2>heading2</h2>
</section>

<section id="heading3">
	<h2>heading3</h2>

	<section id="heading3-1">
		<h3>heading3-1</h3>
	</section>
</section>

<section id="heading4">
	<h3>heading4</h3>
</section>
`);

		const data = getData(window);

		assert.equal(data.length, 2);

		assert.equal(data.at(0)?.id, 'heading2');
		assert.equal(data.at(0)?.headingHtml, 'heading2');

		assert.equal(data.at(1)?.id, 'heading3');
		assert.equal(data.at(1)?.headingHtml, 'heading3');
	});

	await t.test('allowed tags & attr', () => {
		const { window } = new JSDOM(`
<!DOCTYPE html>
<section id="heading1">
	<h2>heading1 <span lang="en">span</span></h2>
</section>
`);

		assert.equal(getData(window).at(0)?.headingHtml, 'heading1 <span lang="en">span</span>');
	});

	await t.test('remove tags & attr', () => {
		const { window } = new JSDOM(`
<!DOCTYPE html>
<section id="heading1">
	<h2>heading1 <span class="foo">span</span> <em>em</em></h2>
</section>
`);

		assert.equal(getData(window).at(0)?.headingHtml, 'heading1 <span>span</span> em');
	});
});
