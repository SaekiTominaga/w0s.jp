import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import * as cheerio from 'cheerio';
import { adjustLinkStylesheetPosition } from './stylesheet.ts';

await test('adjustLinkStylesheetPosition', async (t) => {
	await t.test('no css', () => {
		const $ = cheerio.load(`
<!DOCTYPE html>
<head>
<title>title</title>
<link rel="next" href="page2">
</head>
`);

		adjustLinkStylesheetPosition($);

		assert.equal(
			$('head').html(),
			`
<title>title</title>
<link rel="next" href="page2">
`,
		);
	});

	await t.test('signle css', () => {
		const $ = cheerio.load(`
<!DOCTYPE html>
<head>
<title>title</title>
<link rel="stylesheet" href="css1">
</head>
`);

		adjustLinkStylesheetPosition($);

		assert.equal(
			$('head').html(),
			`
<title>title</title>
<link rel="stylesheet" href="css1">
`,
		);
	});

	await t.test('first place', () => {
		const $ = cheerio.load(`
<!DOCTYPE html>
<head>
<link rel="stylesheet" href="css1">
<link rel="stylesheet" href="css2">
<title>title</title>
</head>
`);

		adjustLinkStylesheetPosition($);

		assert.equal(
			$('head').html(),
			`
<link rel="stylesheet" href="css1"><link rel="stylesheet" href="css2">

<title>title</title>
`,
		);
	});

	await t.test('end place', () => {
		const $ = cheerio.load(`
<!DOCTYPE html>
<head>
<title>title</title>
<link rel="stylesheet" href="css1">
<link rel="stylesheet" href="css2">
</head>
`);

		adjustLinkStylesheetPosition($);

		assert.equal(
			$('head').html(),
			`
<title>title</title>
<link rel="stylesheet" href="css1"><link rel="stylesheet" href="css2">

`,
		);
	});

	await t.test('split', () => {
		const $ = cheerio.load(`
<!DOCTYPE html>
<head>
<link rel="stylesheet" href="css1">
<link rel="stylesheet" href="css2">
<title>title</title>
<link rel="stylesheet" href="css3">
<link rel="stylesheet" href="css4">
</head>
`);

		adjustLinkStylesheetPosition($);

		assert.equal(
			$('head').html(),
			`
<link rel="stylesheet" href="css1"><link rel="stylesheet" href="css2"><link rel="stylesheet" href="css3"><link rel="stylesheet" href="css4">

<title>title</title>


`,
		);
	});
});
