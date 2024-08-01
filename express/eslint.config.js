// @ts-check

import w0sConfig from '@w0s/eslint-config';

/** @type {import("@typescript-eslint/utils/ts-eslint").FlatConfig.ConfigArray} */
export default [
	...w0sConfig,
	{
		ignores: ['dist/**/*.js'],
	},
	{
		files: ['src/app.ts'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-misused-promises': 'off',
			'@typescript-eslint/no-unsafe-call': 'off', // Github Actions 環境ではエラーになる
		},
	},
];
