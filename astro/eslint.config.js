// @ts-check

import * as astroParser from 'astro-eslint-parser';
import eslintPluginAstro from 'eslint-plugin-astro';
import w0sConfig from '@w0s/eslint-config';

/** @type {import("eslint").Linter.Config[]} */
export default [
	...w0sConfig,
	...eslintPluginAstro.configs.recommended,
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
	},
	{
		files: ['**/*.astro'],
		languageOptions: {
			parser: astroParser,
			parserOptions: {
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.astro'],
			},
		},
		rules: {
			camelcase: [
				'error',
				{
					properties: 'never',
					allow: ['^image_'],
				},
			],
			'consistent-return': 'off',
			'no-irregular-whitespace': 'off',
			'import/default': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/named': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/namespace': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/no-deprecated': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/no-extraneous-dependencies': [
				'error',
				{
					devDependencies: false,
					optionalDependencies: false,
					peerDependencies: false,
					bundledDependencies: false,
					packageDir: ['../', './'],
				},
			],
			'import/no-named-as-default': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/no-named-as-default-member': 'off', // `parseForESLint` from parser `context.languageOptions.parser` is invalid and will just be ignored
			'import/no-unresolved': 'off',
		},
	},
	{
		files: ['build/**/*.ts'],
		rules: {
			'no-console': 'off',
			'import/no-extraneous-dependencies': [
				'error',
				{
					devDependencies: true,
					optionalDependencies: false,
					peerDependencies: false,
					bundledDependencies: false,
				},
			],
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
		files: ['astro.config.mjs'],
		rules: {
			'import/no-unresolved': 'off',
		},
	},
];
