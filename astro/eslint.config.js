// @ts-check

import parserAstro from 'astro-eslint-parser';
import pluginAstro from 'eslint-plugin-astro';
import w0sConfig from '@w0s/eslint-config';

/** @type {import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray} */
export default [
	...w0sConfig,
	...pluginAstro.configs.recommended,
	{
		ignores: ['dist/**/*.mjs', 'src/env.d.ts', 'src/pages/kumeta/manga/subtitle.astro', 'public/assets/script/*.js', 'public/assets/script/*.mjs'],
	},
	{
		files: ['**/*.astro'],
		languageOptions: {
			parser: parserAstro,
			parserOptions: {
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.astro'],
			},
		},
		rules: {
			'consistent-return': 'off',
			'no-irregular-whitespace': 'off',
			'no-undef-init': 'off',
			'no-useless-return': 'off',
			'import/no-unresolved': 'off',
			'import/prefer-default-export': 'off',
			'jsdoc/require-param-type': 'off',
			'jsdoc/require-property-type': 'off',
			'jsdoc/require-returns-type': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
	{
		files: ['build/**/*.js'],
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['script/**/*.ts'],
		rules: {
			'no-console': [
				'warn',
				{
					allow: ['info', 'error'],
				},
			],
			'@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
			'@typescript-eslint/no-unnecessary-condition': 'off',
		},
	},
	{
		files: ['script/*.ts'],
		rules: {
			'no-new': 'off',
		},
	},
	{
		files: ['script/analytics.ts'],
		languageOptions: {
			parserOptions: {
				sourceType: 'script',
			},
		},
		rules: {
			'no-implicit-globals': 'off',
			'no-multi-assign': 'off',
			'no-underscore-dangle': 'off',
			'no-var': 'off',
		},
	},
	{
		files: ['script/trusted-types.ts'],
		languageOptions: {
			parserOptions: {
				sourceType: 'script',
			},
		},
		rules: {
			strict: 'off',
		},
	},
	{
		files: ['src/**/*.astro', 'src/**/*.ts'],
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['src/+util/Request.ts'],
		rules: {
			'@typescript-eslint/no-unsafe-return': 'off',
		},
	},
];
