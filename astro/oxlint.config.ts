import { defineConfig } from 'oxlint';
import config from '@w0s/oxlint-config/node';

export default defineConfig({
	extends: [config],
	overrides: [
		{
			files: ['*.astro'],
			env: {
				astro: true,
			},
		},
		{
			files: ['build/**/*.ts'],
			rules: {
				'no-console': 'off',
			},
		},
		{
			files: ['e2e/**/*.spec.ts'],
			jsPlugins: [
				{
					name: 'playwright',
					specifier: 'eslint-plugin-playwright',
				},
			],
			rules: {
				'playwright/consistent-spacing-between-blocks': 'error', // ✅
				'playwright/expect-expect': 'error', // ✅
				'playwright/max-nested-describe': 'error', // ✅
				'playwright/missing-playwright-await': 'error', // ✅
				'playwright/no-commented-out-tests': 'error',
				'playwright/no-conditional-expect': 'error', // ✅
				'playwright/no-conditional-in-test': 'error', // ✅
				'playwright/no-duplicate-hooks': 'error', // ✅
				'playwright/no-duplicate-slow': 'error', // ✅
				'playwright/no-element-handle': 'error', // ✅
				'playwright/no-eval': 'error', // ✅
				'playwright/no-focused-test': 'error', // ✅
				'playwright/no-force-option': 'error', // ✅
				'playwright/no-get-by-title': 'error',
				'playwright/no-nested-step': 'error', // ✅
				'playwright/no-networkidle': 'error', // ✅
				'playwright/no-page-pause': 'error', // ✅
				'playwright/no-restricted-locators': 'error',
				'playwright/no-restricted-matchers': 'error',
				'playwright/no-restricted-roles': 'error',
				'playwright/no-skipped-test': 'off', // ✅
				'playwright/no-slowed-test': 'error',
				'playwright/no-standalone-expect': 'error', // ✅
				'playwright/no-unnecessary-assertions': 'error', // ✅
				'playwright/no-unsafe-references': 'error', // ✅
				'playwright/no-unused-locators': 'error', // ✅
				'playwright/no-useless-await': 'error', // ✅
				'playwright/no-useless-not': 'error', // ✅
				'playwright/no-wait-for-navigation': 'error', // ✅
				'playwright/no-wait-for-selector': 'error', // ✅
				'playwright/no-wait-for-timeout': 'error', // ✅
				'playwright/prefer-comparison-matcher': 'error',
				'playwright/prefer-equality-matcher': 'error',
				'playwright/prefer-hooks-in-order': 'error', // ✅
				'playwright/prefer-hooks-on-top': 'error', // ✅
				'playwright/prefer-native-locators': 'error',
				'playwright/prefer-locator': 'error', // ✅
				'playwright/prefer-strict-equal': 'error',
				'playwright/prefer-to-be': 'error',
				'playwright/prefer-to-contain': 'error',
				'playwright/prefer-to-have-count': 'error', // ✅
				'playwright/prefer-to-have-length': 'error', // ✅
				'playwright/prefer-web-first-assertions': 'error', // ✅
				'playwright/require-hook': 'error',
				'playwright/require-to-pass-timeout': 'error',
				'playwright/require-to-throw-message': 'error',
				'playwright/valid-describe-callback': 'error', // ✅
				'playwright/valid-expect-in-promise': 'error', // ✅
				'playwright/valid-expect': 'error', // ✅
				'playwright/valid-title': 'error', // ✅
				'playwright/valid-test-tags': 'error', // ✅
			},
		},
		{
			files: ['src/**/*.astro', 'src/pages/**/*.ts'],
			rules: {
				'import/exports-last': 'off', // `export const prerender` 許容
				'import/group-exports': 'off',
				'import/unambiguous': 'off',
				'unicorn/prefer-module': 'off', // 早期 return
			},
		},
		{
			files: ['src/components/**/*.astro', 'src/layouts/**/*.astro'],
			rules: {
				'unicorn/filename-case': [
					'error',
					{
						cases: {
							pascalCase: true,
						},
					},
				],
			},
		},
		{
			files: ['src/components/**/*.test.ts'],
			rules: {
				'typescript/ban-ts-comment': [
					'error',
					{
						'ts-ignore': 'allow-with-description',
					},
				],
				'typescript/no-unsafe-argument': 'off',
				'typescript/prefer-ts-expect-error': 'off', // `@ts-ignore` 許容
				'unicorn/prefer-dom-node-dataset': 'off',
			},
		},
		{
			files: ['src/middleware/index.ts'],
			rules: {
				'node/callback-return': 'off',
			},
		},
		{
			files: ['src/pages/**/*.{astro,ts}'],
			rules: {
				'unicorn/filename-case': [
					'error',
					{
						cases: {
							lowercase: true,
						},
					},
				],
			},
		},
		{
			files: ['src/env.d.ts'],
			rules: {
				'import/unambiguous': 'off',
			},
		},
		{
			files: ['src/logger.ts'],
			rules: {
				'node/no-process-env': 'off',
			},
		},
		{
			files: ['playwright.config.js'],
			rules: {
				'typescript/strict-boolean-expressions': 'off',
				'node/no-process-env': 'off',
			},
		},
	],
});
