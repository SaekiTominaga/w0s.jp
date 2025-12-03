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
			'dot-notation': 'off',
			'no-console': 'off',
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
		files: ['src/**/*.ts'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/dot-notation': 'off',
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
