import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

/* 更新情報 */
const updateSchema = z.object({
	updated: z.coerce.date(),
	content: z.string(),
});

export const collections = {
	updateKumeta: defineCollection({
		loader: file('update/kumeta.yaml'),
		schema: updateSchema,
	}),
	updateMadoka: defineCollection({
		loader: file('update/madoka.yaml'),
		schema: updateSchema,
	}),
	updateTokyu: defineCollection({
		loader: file('update/tokyu.yaml'),
		schema: updateSchema,
	}),
};
