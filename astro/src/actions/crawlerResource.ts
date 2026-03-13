import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { SqliteError } from 'better-sqlite3';
import { env } from '@w0s/env-value-type';
import configCrawlerResource from '@config/crawler-resource.ts';
import CrawlerResourceDao from '@db/CrawlerResource.ts';

export const crawlerResource = {
	/* データ登録 */
	insert: defineAction({
		accept: 'form',
		input: z.object({
			url: z.string().url(),
			title: z.string(),
			category: z.number(),
			priority: z.number(),
			browser: z.boolean(),
			selector: z.string().optional(),
		}),
		handler: async (input) => {
			const dao = new CrawlerResourceDao(`${env('ROOT')}/${env('SQLITE_DIR')}/${env('SQLITE_CRAWLER')}`);
			try {
				await dao.insert({
					url: new URL(input.url),
					title: input.title,
					category: input.category,
					priority: input.priority,
					browser: input.browser,
					selector: input.selector,
				});
			} catch (e) {
				if (!(e instanceof SqliteError)) {
					throw e;
				}

				switch (e.code) {
					case 'SQLITE_CONSTRAINT_PRIMARYKEY':
					case 'SQLITE_CONSTRAINT_UNIQUE': {
						return {
							url: input.url,
							errorMessage: configCrawlerResource.validator.unique,
						};
					}
					default:
				}

				throw e;
			}

			return {
				url: input.url,
			};
		},
	}),
	/* データ更新 */
	update: defineAction({
		accept: 'form',
		input: z.object({
			url: z.string().url(),
			title: z.string(),
			category: z.number(),
			priority: z.number(),
			browser: z.boolean(),
			selector: z.string().optional(),
			baseurl: z.string(),
		}),
		handler: async (input) => {
			const dao = new CrawlerResourceDao(`${env('ROOT')}/${env('SQLITE_DIR')}/${env('SQLITE_CRAWLER')}`);
			try {
				await dao.update(
					{
						url: new URL(input.url),
						title: input.title,
						category: input.category,
						priority: input.priority,
						browser: input.browser,
						selector: input.selector,
					},
					input.baseurl,
				);
			} catch (e) {
				if (!(e instanceof SqliteError)) {
					throw e;
				}

				switch (e.code) {
					case 'SQLITE_CONSTRAINT_PRIMARYKEY':
					case 'SQLITE_CONSTRAINT_UNIQUE': {
						return {
							url: input.url,
							errorMessage: configCrawlerResource.validator.unique,
						};
					}
					default:
				}

				throw e;
			}

			return {
				url: input.url,
			};
		},
	}),
	/* データ削除 */
	delete: defineAction({
		accept: 'form',
		input: z.object({
			url: z.string().url(),
		}),
		handler: async (input) => {
			const dao = new CrawlerResourceDao(`${env('ROOT')}/${env('SQLITE_DIR')}/${env('SQLITE_CRAWLER')}`);
			await dao.delete(input.url);

			return {
				url: input.url,
			};
		},
	}),
};
