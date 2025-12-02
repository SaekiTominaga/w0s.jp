/// <reference types="vitest/config" />

import { getViteConfig } from 'astro/config';

export default getViteConfig({
	test: {
		include: ['src/components/**/*.test.ts'],
		coverage: {
			reporter: ['text'],
		},
	},
});
