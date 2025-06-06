// @ts-check

/** @type {import('stylelint').Config} */
export default {
	extends: ['@w0s/stylelint-config'],
	rules: {
		'max-nesting-depth': [
			5,
			{
				severity: 'warning',
			},
		],
		'selector-class-pattern':
			'^([lcpu])-([a-z][a-z0-9]*)(-[a-z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*){0,2}$|^-([a-z][a-z0-9]*)(-[a-z0-9]+)*$|^adsbygoogle$',
	},
};
