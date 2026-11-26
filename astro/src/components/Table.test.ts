import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse } from 'node-html-parser';
import { describe, expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import Table from './Table.astro';

const container = await AstroContainer.create();

describe('attribute', () => {
	test('minimum attributes', async () => {
		const result = await container.renderToString(Table, {
			props: {},
			slots: {
				default: '',
			},
		});

		const $root = parse(result);

		const $wrapper = $root.querySelector('.table-wrapper');

		expect($wrapper?.getAttribute('id')).toBeUndefined();
		expect($wrapper?.getAttribute('class')).match(/table-wrapper astro-[a-z0-9]+/u);
	});

	test('all attributes', async () => {
		const result = await container.renderToString(Table, {
			props: {
				id: 'id',
				full: true,
				scroll: true,
				font: 'small',
			},
			slots: {
				default: '',
			},
		});

		const $root = parse(result);

		const $wrapper = $root.querySelector('.table-wrapper');

		expect($wrapper?.getAttribute('id')).toBe('id');
		expect($wrapper?.getAttribute('class')).match(/table-wrapper -full -scroll -font-small astro-[a-z0-9]+/u);
	});
});

describe('element', () => {
	test('minimum elements', async () => {
		const result = await container.renderToString(Table, {
			props: {},
			slots: {
				default: `
<table></table>
				`,
			},
		});

		const $root = parse(result);

		const $table = $root.querySelector('table');
		const $caption = $root.querySelector('caption');
		const $thead = $root.querySelector('thead');
		const $$tbody = $root.querySelectorAll('tbody');
		const $tfoot = $root.querySelector('tfoot');

		expect($table?.getAttribute('class')).match(/js-thead-sticky-table astro-[a-z0-9]+/u);
		expect($table?.innerHTML.trim()).toBe('');
		expect($caption).toBeNull();
		expect($thead).toBeNull();
		expect($$tbody.length).toBe(0);
		expect($tfoot).toBeNull();
	});

	test('all elements', async () => {
		const result = await container.renderToString(Table, {
			props: {},
			slots: {
				default: `
<table>
	<caption>caption</caption>
	<thead></thead>
	<tbody></tbody>
	<tbody></tbody>
	<tfoot></tfoot>
</table>
				`,
			},
		});

		const $root = parse(result);

		const $caption = $root.querySelector('caption');
		const $thead = $root.querySelector('thead');
		const $$tbody = $root.querySelectorAll('tbody');
		const $tfoot = $root.querySelector('tfoot');

		expect($caption?.innerHTML.trim()).match(/<div class="caption-inner astro-[a-z0-9]+">\n\t+caption\n\t+<\/div>/u);
		expect($thead).not.toBeNull();
		expect($$tbody.length).toBe(2);
		expect($tfoot).not.toBeNull();
	});
});
