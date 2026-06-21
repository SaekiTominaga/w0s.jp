// @ts-check

/** @type {import('stylelint').Config} */
export default {
	rules: {
		'max-nesting-depth': [
			2,
			{
				severity: 'warning',
			},
		],
	},
	referenceFiles: {
		files: ['../frontend/style/foundation/_var.css'],
	},
	extends: ['@w0s/stylelint-config'],
	ignoreFiles: ['dist/client/**/*.css'],
	overrides: [
		{
			files: ['**/*.astro'],
			customSyntax: 'postcss-html',
		},
		{
			files: ['src/components/**/*.astro'],
			rules: {
				'selector-class-pattern': /^-?([a-z][a-z0-9]*)(-[a-z0-9]+)*$/v,
				'selector-pseudo-class-no-unknown': null, // allow `:global()` selector https://docs.astro.build/en/guides/styling/#global-styles

				'order/order': [
					[
						'custom-properties',
						'declarations',
						{
							type: 'at-rule',
							name: 'supports',
							hasBlock: true,
						},
						'rules',
					],
				],
			},
		},
		{
			files: ['src/pages/**/*.astro'],
			rules: {
				'custom-property-empty-line-before': null,
			},
		},
	],
};
