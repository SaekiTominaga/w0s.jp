// @ts-check

import parserAstro from 'astro-eslint-parser';
import { configs as pluginAstroConfigs } from 'eslint-plugin-astro';
import w0sConfig from '@w0s/eslint-config';

/** @type {import("eslint").Linter.Config[]} */
export default [
	...w0sConfig,
	...pluginAstroConfigs.recommended,
	{
		ignores: ['dist', 'src/pages/kumeta/manga/subtitle.astro'],
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'import/no-extraneous-dependencies': [
				'error',
				{
					packageDir: ['../', './'],
				},
			],
		},
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
			'no-console': 'off',
			'no-irregular-whitespace': 'off',
			'no-useless-return': 'off',
			'import/default': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/named': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/namespace': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/no-deprecated': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/no-extraneous-dependencies': [
				'error',
				{
					packageDir: ['../', './'],
				},
			],
			'import/no-named-as-default': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/no-named-as-default-member': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/no-unresolved': 'off',
			'jsdoc/require-param-type': 'off',
			'jsdoc/require-returns-type': 'off',
		},
	},
	{
		files: ['src/**/*.ts'],
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['src/+util/**/*.ts'],
		rules: {
			'func-style': [
				'error',
				'expression',
				{
					overrides: {
						namedExports: 'ignore',
					},
				},
			],
		},
	},
	{
		files: ['src/components/**/*.test.ts'],
		rules: {
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
		},
	},
	{
		files: ['build/**/*.ts'],
		rules: {
			'no-console': 'off',
		},
	},
	{
		files: ['astro.config.mjs'],
		rules: {
			'import/no-unresolved': 'off',
		},
	},
];
