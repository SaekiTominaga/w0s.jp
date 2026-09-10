import { defineConfig } from 'oxlint';
import config from '@w0s/oxlint-config/browser';

export default defineConfig({
	extends: [config],
	overrides: [
		{
			files: ['src/analytics.ts'],
			rules: {
				'no-implicit-globals': 'off',
				'no-multi-assign': 'off',
				'no-underscore-dangle': 'off',
				'no-var': 'off',
			},
		},
	],
});
