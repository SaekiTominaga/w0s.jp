// @ts-check

/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-html/astro', '@w0s/stylelint-config'],
	ignoreFiles: ['dist/client/**/*.css'],
	rules: {
		'selector-pseudo-class-no-unknown': null, // allow `:global()` selector https://docs.astro.build/en/guides/styling/#global-styles
		'max-nesting-depth': [
			2,
			{
				severity: 'warning',
			},
		],
		'selector-class-pattern': /^-?([a-z][a-z0-9]*)(-[a-z0-9]+)*$/,
	},
};
