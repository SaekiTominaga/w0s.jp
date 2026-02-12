import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getParams } from './request.ts';

await test('getParams', () => {
	assert.equal(getParams(new URL('http://example.com/?foo=hoge;bar=piyo')).toString(), 'foo=hoge&bar=piyo');
});
