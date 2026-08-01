import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { dateDisplay } from './date.ts';

await test('dateDisplay', async (t) => {
	await t.test('YYYY-MM-DD', () => {
		assert.equal(dateDisplay('2000-01-02'), '2000年1月2日');
	});

	await t.test('YYYY-MM', () => {
		assert.equal(dateDisplay('2000-01'), '2000年1月');
	});

	await t.test('YYYY', () => {
		assert.equal(dateDisplay('2000'), '2000年');
	});

	await t.test('undefined', () => {
		assert.equal(dateDisplay(undefined), undefined);
	});

	await test('no data-by', () => {
		assert.throws(
			() => {
				dateDisplay('foo123');
			},
			{
				name: 'Error',
				message: 'Invalid date format: `foo123`',
			},
		);
	});
});
