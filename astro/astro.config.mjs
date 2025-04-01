import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

/* https://docs.astro.build/en/reference/configuration-reference/ */
export default defineConfig({
	site: 'https://w0s.jp',
	output: 'static',
	adapter: node({
		mode: 'middleware',
	}),
	srcDir: 'src',
	publicDir: '../public',
	outDir: 'dist',
	compressHTML: false,
	scopedStyleStrategy: 'where',
	security: {
		checkOrigin: false, // https://github.com/withastro/astro/issues/12851
	},
	vite: {
		build: {
			minify: false,
		},
	},
	build: {
		format: 'preserve',
		assets: 'assets/astro',
		inlineStylesheets: 'never',
	},
	server: {
		port: 3000,
	},
});
