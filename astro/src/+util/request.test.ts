import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { boolean, dateYYYYMM, getParams, number, string, stringEmpty, strings } from './request.ts';

await test('string', async (t) => {
	await t.test('valid string', () => {
		assert.equal(getParams(new URL('http://example.com/?foo=hoge;bar=piyo')).toString(), 'foo=hoge&bar=piyo');
	});

	await t.test('undefined', () => {
		assert.equal(string(undefined), undefined);
	});
});

await test('string', async (t) => {
	await t.test('valid string', () => {
		assert.equal(string('abc'), 'abc');
	});

	await t.test('undefined', () => {
		assert.equal(string(undefined), undefined);
	});
});

await test('stringEmpty', async (t) => {
	await t.test('valid string', () => {
		assert.equal(stringEmpty('abc'), 'abc');
	});

	await t.test('empty string', () => {
		assert.equal(stringEmpty(''), undefined);
	});
});

await test('strings', async (t) => {
	await t.test('valid array', () => {
		assert.deepEqual(strings(['abc', 'def']), ['abc', 'def']);
	});

	await t.test('not array', () => {
		assert.deepEqual(strings('abc'), []);
	});
});

await test('number', async (t) => {
	await t.test('valid string', () => {
		assert.equal(number('123'), 123);
	});

	await t.test('not string', () => {
		assert.equal(number(123), undefined);
	});
});

await test('boolean', async (t) => {
	await t.test('string', () => {
		assert.equal(boolean('true'), true);
	});

	await t.test('number', () => {
		assert.equal(boolean(0), false);
	});
});

await test('dateYYYYMM', async (t) => {
	await t.test('valid format', () => {
		assert.equal(dateYYYYMM('2000-01')?.format('YYYY年M月'), '2000年1月');
	});

	await t.test('not string', () => {
		assert.equal(dateYYYYMM(123), undefined);
	});
});
