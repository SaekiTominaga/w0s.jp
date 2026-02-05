import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { env } from '@w0s/env-value-type';
import CrawlerNewsDataDao from '@db/CrawlerNewsData';

export const crawlerNews = {
	deleteNewsData: defineAction({
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
