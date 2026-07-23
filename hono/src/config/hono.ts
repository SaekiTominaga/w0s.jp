interface HonoConfig {
	response: {
		header: {
			hsts: string;
			csp: Record<string, string[]>;
			cspHtml: Record<string, string[]>;
			csproHtml: Record<string, string[]>;
			reportingEndpoints: Record<string, string>;
		};
		compression: {
			threshold: number;
		};
	};
	static: {
		root: string;
		index: string;
		extensions: string[];
		headers: {
			contentType: {
				path: Record<string, string>;
				extension: Record<string, string>;
			};
			cacheControl: {
				default: string;
				path?: {
					paths: string[];
					value: string;
				}[];
				extension: {
					extensions: string[];
					value: string;
				}[];
			};
			sourceMap: string[];
		};
	};
	basicAuth: {
		paths: string[];
		realm: string;
		env: string;
	}[];
	redirect: {
		from: string;
		to: string;
	}[];
	errorpage: {
		unauthorized: string;
		notfound: string;
		clientError: string;
		serverError: string;
	};
}

const config: HonoConfig = {
	response: {
		header: {
			hsts: 'max-age=31536000',
			csp: {
				'frame-ancestors': ["'self'"],
				'report-uri': ['https://report.w0s.jp/report/csp'],
				'report-to': ['default'],
			},
			cspHtml: {
				'base-uri': ["'none'"],
				'form-action': ["'self'", 'https://www.google.com'],
				'frame-ancestors': ["'self'"],
				'report-uri': ['https://report.w0s.jp/report/csp'],
				'report-to': ['default'],
			},
			csproHtml: {
				'default-src': ["'self'"],
				'connect-src': [
					"'self'",
					'https://*.w0s.jp',
					'https://pagead2.googlesyndication.com',
					'https://csi.gstatic.com',
					'https://ep1.adtrafficquality.google',
				],
				'font-src': ["'self'", 'data:'],
				'frame-src': [
					"'self'",
					'https://www.youtube-nocookie.com',
					'https://www.google.com',
					'https://tpc.googlesyndication.com',
					'https://googleads.g.doubleclick.net',
					'https://ep2.adtrafficquality.google',
				],
				'img-src': [
					"'self'",
					'data:',
					'https://m.media-amazon.com',
					'https://*.ytimg.com',
					'https://pagead2.googlesyndication.com',
					'https://ep1.adtrafficquality.google',
				],
				'media-src': ["'self'"],
				'script-src-elem': [
					"'self'",
					'https://analytics.w0s.jp',
					'https://pagead2.googlesyndication.com',
					'https://tpc.googlesyndication.com',
					'https://ep2.adtrafficquality.google',
				],
				'style-src': ["'self'", "'unsafe-inline'"],
				'trusted-types': ['default', 'goog#html', 'google#safe', "'allow-duplicates'"],
				'require-trusted-types-for': ["'script'"],
				'report-uri': ['https://report.w0s.jp/report/csp'],
				'report-to': ['default'],
			},
			reportingEndpoints: {
				default: 'https://report.w0s.jp/report/csp',
			},
		},
		compression: {
			threshold: 512,
		},
	},
	static: {
		root: '../astro/dist/client',
		index: 'index.html',
		extensions: ['.html', '.atom', '.osdx'], // URL 上で省略できる拡張子
		headers: {
			contentType: {
				path: {
					'/favicon.ico': 'image/svg+xml; charset=utf-8',
				},
				extension: {
					/* hono 公式で規定されていないもの https://github.com/honojs/hono/blob/main/src/utils/mime.ts */
					'.atom': 'application/atom+xml; charset=utf-8',
					'.map': 'application/octet-stream',
					'.osdx': 'application/opensearchdescription+xml; charset=utf-8',
					'.m4a': 'audio/mp4',
					'.vtt': 'text/vtt',
				},
			},
			cacheControl: {
				default: 'max-age=600', // 10分
				path: [
					{
						paths: ['/favicon.ico'],
						value: 'max-age=604800', // 1週間
					},
				],
				extension: [
					{
						extensions: ['.avif', '.webp', '.jpg', '.jpeg', '.png', '.svg', '.m4a', '.mp4', '.webm'],
						value: 'max-age=3600', // 1時間
					},
					{
						extensions: ['.woff2'],
						value: 'max-age=2592000', // 1か月
					},
					{
						extensions: ['.map'],
						value: 'no-cache',
					},
				],
			},
			sourceMap: ['.js', '.mjs'],
		},
	},
	basicAuth: [
		{
			paths: ['/admin/*'],
			realm: 'Admin',
			env: 'AUTH_FILE_ADMIN',
		},
		{
			paths: ['/madoka/dojin/pdf/pictorial6/*'],
			realm: 'The Cycle Pictorial 6',
			env: 'AUTH_FILE_MADOKA_PICTORIAL6',
		},
		{
			paths: ['/madoka/dojin/pdf/pictorial7/*'],
			realm: 'The Cycle Pictorial 7',
			env: 'AUTH_FILE_MADOKA_PICTORIAL7',
		},
		{
			paths: ['/madoka/dojin/pdf/pictorial8/*'],
			realm: 'The Cycle Pictorial 8',
			env: 'AUTH_FILE_MADOKA_PICTORIAL8',
		},
		{
			paths: ['/madoka/dojin/pdf/pictorial9/*'],
			realm: 'The Cycle Pictorial 9',
			env: 'AUTH_FILE_MADOKA_PICTORIAL9',
		},
		{
			paths: ['/madoka/dojin/pdf/pictorial10/*'],
			realm: 'The Cycle Pictorial 10',
			env: 'AUTH_FILE_MADOKA_PICTORIAL10',
		},
	],
	redirect: [
		{
			/* 2013-04-01 実施【恒久維持】 */
			from: '/sty/:page{[a-z0-9_]+}',
			to: '/tokyu/machine/$1',
		},
		{
			/* 2013-04-01 実施【恒久維持】 */
			from: '/an/:page{[a-z0-9_]+}',
			to: '/tokyu/an/$1',
		},
		{
			/* 2013-04-01 実施【恒久維持】 */
			from: '/an',
			to: '/tokyu/an/',
		},
		{
			/* 2018-04-22 実施【恒久維持】 */
			from: '/madoka-magica/coterie/the-cycle-pictorial_6',
			to: '/madoka/dojin/pictorial6',
		},
		{
			/* 2018-04-22 実施【恒久維持】 */
			from: '/madoka-magica/coterie/the-cycle-pictorial_7',
			to: '/madoka/dojin/pictorial7',
		},
		{
			/* 2018-04-22 実施【恒久維持】 */
			from: '/madoka-magica/coterie/the-cycle-pictorial_8',
			to: '/madoka/dojin/pictorial8',
		},
		{
			/* 2018-04-22 実施【恒久維持】 */
			from: '/madoka-magica/dojin/pictorial9',
			to: '/madoka/dojin/pictorial9',
		},
		{
			/* 2018-04-22 実施【恒久維持】 */
			from: '/madoka-magica/dojin/pictorial10',
			to: '/madoka/dojin/pictorial10',
		},
		{
			/* 2018-04-22 実施【恒久維持】 */
			from: '/madoka-magica/dojin/pictorial11',
			to: '/madoka/dojin/pictorial11',
		},
		{
			/* 2021-04-19 実施【恒久維持】 */
			from: '/diary/',
			to: 'https://blog.w0s.jp/',
		},
		{
			/* 2021-04-19 実施【恒久維持】 */
			from: '/diary/:entryId{[1-9][0-9]{0,2}}',
			to: 'https://blog.w0s.jp/entry/$1',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/',
			to: '/tokyu/machine/',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/:page{[a-z0-9_]+}',
			to: '/tokyu/machine/$1',
		},
	],
	errorpage: {
		unauthorized: '401.html', // 401
		notfound: '404.html', // 404
		clientError: '4xx.html', // 4xx
		serverError: '5xx.html', // 5xx
	},
} as const;

export default config;
