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
	security: {
		checkOrigin: false, // https://github.com/withastro/astro/issues/12851
	},
	build: {
		format: 'preserve',
	},
	server: {
		port: 3000,
	},
});
