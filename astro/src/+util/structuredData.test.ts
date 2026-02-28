import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getJsonLd } from './structuredData.ts';

await test('getJsonLd', async (t) => {
	await t.test('JSON-LD を出力しない', () => {
		assert.equal(
			getJsonLd(
				{
					title: '',
				},
				{
					site: '',
				},
			),
			undefined,
		);
	});

	await t.test('最低限', () => {
		assert.deepEqual(
			getJsonLd(
				{
					title: 'page title',
					description: 'page description',
				},
				{
					site: 'http://example.com',
				},
			),
			{
				'@context': 'https://schema.org/',
				'@type': 'WebPage',
				description: 'page description',
				headline: 'page title',
			},
		);
	});

	await t.test('パンくず', () => {
		assert.deepEqual(
			getJsonLd(
				{
					title: 'page title',
					breadcrumb: [
						{
							path: '/1',
							name: 'page1',
						},
						{
							path: '/1/2',
							name: 'page2',
						},
					],
				},
				{
					site: 'http://example.com',
				},
			)?.breadcrumb,
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						item: 'http://example.com/1',
						name: 'page1',
						position: 1,
					},
					{
						'@type': 'ListItem',
						item: 'http://example.com/1/2',
						name: 'page2',
						position: 2,
					},
					{
						'@type': 'ListItem',
						name: 'page title',
						position: 3,
					},
				],
			},
		);
	});

	await t.test('dateModified', () => {
		assert.equal(
			getJsonLd(
				{
					title: 'page title',
					description: 'page description',
					dateModified: '2000-01-01',
				},
				{
					site: 'http://example.com',
				},
			)?.dateModified,
			'20000101T0000',
		);
	});

	await t.test('image', () => {
		assert.equal(
			getJsonLd(
				{
					title: 'page title',
					description: 'page description',
					image: 'http://example.com/image.jpg',
				},
				{
					site: 'http://example.com',
				},
			)?.image,
			'http://example.com/image.jpg',
		);
	});

	await t.test('mainEntity', () => {
		assert.deepEqual(
			getJsonLd(
				{
					title: 'page title',
					description: 'page description',
					mainEntity: {
						'@type': 'Person',
						name: '坪内地丹',
					},
				},
				{
					site: 'http://example.com',
				},
			)?.mainEntity,
			{
				'@type': 'Person',
				name: '坪内地丹',
			},
		);
	});
});
