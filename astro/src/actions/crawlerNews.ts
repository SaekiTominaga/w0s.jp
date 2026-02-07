import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { SqliteError } from 'better-sqlite3';
import { env } from '@w0s/env-value-type';
import configCrawlerNews from '@config/crawler-news.ts';
import CrawlerNewsDao from '@db/CrawlerNews.ts';
import CrawlerNewsDataDao from '@db/CrawlerNewsData.ts';

export const crawlerNews = {
	/* サイトデータ登録 */
	newsinsert: defineAction({
		accept: 'form',
		input: z.object({
			url: z.string().url(),
			title: z.string(),
			category: z.number(),
			priority: z.number(),
			browser: z.boolean(),
			selectorwrap: z.string(),
			selectordate: z.string().optional(),
			selectorcontent: z.string().optional(),
		}),
		handler: async (input) => {
			const dao = new CrawlerNewsDao(env('SQLITE_CRAWLER'));
			try {
				await dao.insert({
					url: new URL(input.url),
					title: input.title,
					category: input.category,
					priority: input.priority,
					browser: input.browser,
					selector_wrap: input.selectorwrap,
					selector_date: input.selectordate,
					selector_content: input.selectorcontent,
				});
			} catch (e) {
				if (!(e instanceof SqliteError)) {
					throw e;
				}

				switch (e.code) {
					case 'SQLITE_CONSTRAINT_UNIQUE': {
						return {
							url: input.url,
							errorMessage: configCrawlerNews.validator.unique,
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
	/* サイトデータ更新 */
	newsupdate: defineAction({
		accept: 'form',
		input: z.object({
			url: z.string().url(),
			title: z.string(),
			category: z.number(),
			priority: z.number(),
			browser: z.boolean(),
			selectorwrap: z.string(),
			selectordate: z.string().optional(),
			selectorcontent: z.string().optional(),
			baseurl: z.string(),
		}),
		handler: async (input) => {
			const dao = new CrawlerNewsDao(env('SQLITE_CRAWLER'));
			try {
				await dao.update(
					{
						url: new URL(input.url),
						title: input.title,
						category: input.category,
						priority: input.priority,
						browser: input.browser,
						selector_wrap: input.selectorwrap,
						selector_date: input.selectordate,
						selector_content: input.selectorcontent,
					},
					input.baseurl,
				);
			} catch (e) {
				if (!(e instanceof SqliteError)) {
					throw e;
				}

				switch (e.code) {
					case 'SQLITE_CONSTRAINT_UNIQUE': {
						return {
							url: input.url,
							errorMessage: configCrawlerNews.validator.unique,
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
	/* サイトデータ削除 */
	newsdelete: defineAction({
		accept: 'form',
		input: z.object({
			id: z.string(),
		}),
		handler: async (input) => {
			const dao = new CrawlerNewsDao(env('SQLITE_CRAWLER'));
			await dao.delete(input.id);

			return {
				id: input.id,
			};
		},
	}),
	/* ニュースデータ削除 */
	newsdatadelete: defineAction({
		accept: 'form',
		input: z.object({
			newsid: z.string(),
			id: z.string(),
		}),
		handler: async (input) => {
			const dao = new CrawlerNewsDataDao(env('SQLITE_CRAWLER'));
			await dao.delete(input.id);

			return {
				id: input.id,
				newsId: input.newsid,
			};
		},
	}),
};
