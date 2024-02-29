import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = {
	singleQuote: true,
	plugins: [require.resolve('prettier-plugin-astro')],

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
				printWidth: 9999,
				singleQuote: false,
			},
		},
	],
};
export default config;
