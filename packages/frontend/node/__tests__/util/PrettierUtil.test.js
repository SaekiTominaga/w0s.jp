import { describe, expect, test } from '@jest/globals';
import PrettierUtil from '../../dist/util/PrettierUtil.js';

describe('configOverrideAssign()', () => {
	test('files - string', () => {
		expect(
			PrettierUtil.configOverrideAssign(
				JSON.parse(`
{
	"printWidth": 100,
	"overrides": [
		{
			"files": ["*.html"],
			"options": {
				"printWidth": 200
			}
		},
		{
			"files": "*.css",
			"options": {
				"printWidth": 300
			}
		}
	]
}
`),
				'*.css',
			),
		).toStrictEqual(
			JSON.parse(`
{
	"printWidth": 300
}
`),
		);
	});

	test('files - array', () => {
		expect(
			PrettierUtil.configOverrideAssign(
				JSON.parse(`
{
	"printWidth": 100,
	"overrides": [
		{
			"files": ["*.html"],
			"options": {
				"printWidth": 200
			}
		},
		{
			"files": "*.css",
			"options": {
				"printWidth": 300
			}
		}
	]
}
`),
				'*.html',
			),
		).toStrictEqual(
			JSON.parse(`
{
	"printWidth": 200
}
`),
		);
	});

	test('unmatch overrides', () => {
		expect(
			PrettierUtil.configOverrideAssign(
				JSON.parse(`
{
	"printWidth": 100,
	"overrides": [
		{
			"files": ["*.html"],
			"options": {
				"printWidth": 200
			}
		}
	]
}
`),
				'*.foo',
			),
		).toStrictEqual(
			JSON.parse(`
{
	"printWidth": 100
}
`),
		);
	});

	test('no overrides', () => {
		expect(
			PrettierUtil.configOverrideAssign(
				JSON.parse(`
{
	"printWidth": 100
}
`),
				'*.css',
			),
		).toStrictEqual(
			JSON.parse(`
{
	"printWidth": 100
}
`),
		);
	});
});
