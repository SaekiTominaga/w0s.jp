// @ts-check

import parserAstro from 'astro-eslint-parser';
import pluginAstro from 'eslint-plugin-astro';
import w0sConfig from '@w0s/eslint-config';

/** @type {import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray} */
export default [
	...w0sConfig,
	...pluginAstro.configs.recommended,
	{
		ignores: ['dist', 'src/pages/kumeta/manga/subtitle.astro', 'public/assets/script/*.js', 'public/assets/script/*.mjs'],
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
			'import/default': 'off', // parser.parse is not a function
			'import/namespace': 'off', // parser.parse is not a function
			'import/no-deprecated': 'off', // parser.parse is not a function
			'import/no-named-as-default': 'off', // parser.parse is not a function
			'import/no-named-as-default-member': 'off', // parser.parse is not a function
			'import/no-unresolved': 'off',
			'import/prefer-default-export': 'off',
			'jsdoc/require-param-type': 'off',
			'jsdoc/require-returns-type': 'off',
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
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
		},
	},
	{
		files: ['src/+util/Request.ts'],
		rules: {
			'@typescript-eslint/no-unsafe-return': 'off',
		},
	},
	{
		files: ['astro.config.mjs'],
		rules: {
			'import/no-unresolved': 'off',
		},
	},
	{
		files: ['eslint.config.js'],
		rules: {
			'import/no-named-as-default-member': 'off',
		},
	},
];
