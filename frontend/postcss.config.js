/** @type {import('postcss-load-config').Config} */
export default {
	plugins: {
		'postcss-custom-media': {},
		'postcss-nesting': {},
		'postcss-import': {},
		cssnano: {
			preset: [
				'lite',
				{
					normalizeWhitespace: false,
				},
			],
		},
	},
};
