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
	publicDir: '../frontend/dist',
	outDir: 'dist',
	compressHTML: false,
	scopedStyleStrategy: 'where',
	vite: {
		/* https://vite.dev/config/build-options.html */
		build: {
			cssCodeSplit: false,
			minify: false,
		},
	},
	security: {
		checkOrigin: false, // https://github.com/withastro/astro/issues/12851
		allowedDomains: [
			{
				hostname: 'localhost',
				protocol: 'http',
				port: '3001',
			},
		],
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
