import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
	srcDir: './src',
	publicDir: './public',
	outDir: './dist',
	site: 'https://w0s.jp',
	adapter: node({
		mode: 'middleware',
	}),
	output: 'hybrid',
	build: {
		format: 'file',
	},
});
