import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
	site: 'https://w0s.jp',
	output: 'static',
	adapter: node({
		mode: 'middleware',
	}),
	srcDir: './src',
	publicDir: './public',
	outDir: './dist',
	build: {
		format: 'file',
	},
	server: {
		port: 3000,
	},
});
