// @ts-check

/** @type {import('stylelint').Config} */
export default {
	rules: {
		'max-nesting-depth': [
			3,
			{
				severity: 'warning',
			},
		],

		/* color function */
		'color-no-hex': true,
		'function-disallowed-list': ['rgb', 'hsl', 'hwb', 'lab', 'lch'], // `color-function` parameter accepts only `oklab()` or `oklch()` <https://drafts.csswg.org/css-color/#typedef-color-function>
	},
	referenceFiles: {
		files: ['../frontend/style/foundation/_var.css'],
	},
	extends: ['@w0s/stylelint-config'],
	overrides: [
		{
			files: ['**/*.astro'],
			customSyntax: 'postcss-html',
		},
		{
			files: ['dist/client/assets/astro/*.css'],
			rules: {
				'at-rule-empty-line-before': null,
				'color-no-hex': null,
				'color-hex-alpha': null,
				'comment-empty-line-before': null,
				'comment-whitespace-inside': null,
				'declaration-empty-line-before': null,
				'declaration-property-value-no-unknown': null,
				'display-notation': null,
				'font-family-name-quotes': null,
				'hue-degree-notation': null,
				'no-duplicate-selectors': null,
				'no-unknown-custom-properties': null,
				'property-layout-mappings': null,
				'selector-class-pattern': null,
				'selector-pseudo-element-colon-notation': null,
				'unit-layout-mappings': null,
				'order/order': null,
			},
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
