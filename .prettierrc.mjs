/** @type {import("prettier").Config} */
const config = {
	printWidth: 160, // rollup-plugin-prettier は .editorconfig の設定が適用されないためここで指定する
	useTabs: true, // rollup-plugin-prettier は .editorconfig の設定が適用されないためここで指定する
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
