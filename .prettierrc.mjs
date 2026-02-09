const config = {
	singleQuote: true,
	plugins: ['prettier-plugin-astro', 'prettier-plugin-ejs'],

	overrides: [
		{
			files: ['*.html', '*.ejs'],
			options: {
				parser: 'html',
				printWidth: 9999,
			},
		},
		{
			files: '*.astro',
			options: {
				parser: 'astro',
				printWidth: 9999,
			},
		},
		{
			files: '*.css',
			options: {
				singleQuote: false,
			},
		},
	],
};
export default config;
