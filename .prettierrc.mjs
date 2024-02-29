import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = {
	singleQuote: true,
	plugins: [require.resolve('prettier-plugin-astro')],

	overrides: [
		{
			files: '*.html',
			options: {
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
