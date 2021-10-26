import path from 'path';
import url from 'url';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default {
	entry: {
		'trusted-types.js': './public/assets/script/_src/trusted-types.ts',
		'google-analytics.js': './public/assets/script/_src/google-analytics.ts',
		'w0s.mjs': './public/assets/script/_src/w0s.ts',
		'error.mjs': './public/assets/script/_src/error.ts',
		'contact.mjs': './public/assets/script/_src/contact.ts',
		'technology.mjs': './public/assets/script/_src/technology.ts',
		'admin_blog_post.mjs': './public/assets/script/_src/admin_blog_post.ts',
		'tokyu_car_history.mjs': './public/assets/script/_src/tokyu_car_history.ts',
	},
	mode: 'production',
	output: {
		filename: '[name]',
		path: `${path.resolve(dirname, 'public/assets/script')}`,
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: {
					loader: 'ts-loader',
					options: {
						configFile: 'public/assets/script/tsconfig.json',
					},
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts'],
	},
	devtool: 'hidden-source-map',
};
