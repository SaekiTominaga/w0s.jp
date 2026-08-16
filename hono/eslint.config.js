// @ts-check

import { defineConfig } from 'eslint/config';
import pluginPlaywright from 'eslint-plugin-playwright';
import w0sConfig from '@w0s/eslint-config';

/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
	...w0sConfig,
	{
		ignores: ['dist'],
	},
	{
		languageOptions: {
			parserOptions: {
				sourceType: 'module',
			},
		},
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
		files: ['e2e/**/*.spec.ts'],
		extends: [pluginPlaywright.configs['flat/recommended']],
		rules: {
			'playwright/no-skipped-test': 'off',
		},
	},
	{
		files: ['src/app.ts'],
		rules: {
			'@typescript-eslint/no-unsafe-call': 'off',
		},
	},
]);
