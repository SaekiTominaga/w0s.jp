import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
	srcDir: './src',
	publicDir: './public',
	outDir: './dist',
	redirects: {},
	site: 'https://w0s.jp',
	adapter: node({
		mode: 'middleware',
	}),
	output: 'hybrid',
	build: {
		format: 'file',
	},
	server: {
		headers: {},
	},
	integrations: [
		sitemap({
			filter: (page) => !page.startsWith('https://w0s.jp/admin/') && !['https://w0s.jp/contact', 'https://w0s.jp/contact_completed'].includes(page),
		}),
	],
});
