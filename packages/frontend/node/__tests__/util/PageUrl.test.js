import { describe, expect, test } from '@jest/globals';
import PageUrl from '../../dist/util/PageUrl.js';

const pageUrl = new PageUrl({ root: 'public', extensions: ['html'], indexes: ['index.html'] });

describe('getUrl()', () => {
	test('index page', () => {
		expect(pageUrl.getUrl('public/index.html')).toBe('/');
		expect(pageUrl.getUrl('./public/index.html')).toBe('/');
		expect(pageUrl.getUrl('public/path/to/index.html')).toBe('/path/to/');
		expect(pageUrl.getUrl('./public/path/to/index.html')).toBe('/path/to/');
	});

	test('html file', () => {
		expect(pageUrl.getUrl('public/foo.html')).toBe('/foo');
		expect(pageUrl.getUrl('./public/foo.html')).toBe('/foo');
		expect(pageUrl.getUrl('public/path/to/foo.html')).toBe('/path/to/foo');
		expect(pageUrl.getUrl('./public/path/to/foo.html')).toBe('/path/to/foo');
	});

	test('non html file', () => {
		expect(pageUrl.getUrl('public/foo.svg')).toBe('/foo.svg');
		expect(pageUrl.getUrl('./public/foo.svg')).toBe('/foo.svg');
		expect(pageUrl.getUrl('public/path/to/foo.svg')).toBe('/path/to/foo.svg');
		expect(pageUrl.getUrl('./public/path/to/foo.svg')).toBe('/path/to/foo.svg');
	});

	test('Windows path separator', () => {
		expect(pageUrl.getUrl('.\\public\\path\\to\\foo.html')).toBe('/path/to/foo');
	});

	test('no root path', () => {
		expect(() => {
			pageUrl.getUrl('path/to/foo.svg');
		}).toThrow('\'path/to/foo.svg\' must be under the root path.');
	});
});