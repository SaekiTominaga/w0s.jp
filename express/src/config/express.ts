export default {
	extension: {
		brotli: '.br',
		map: '.map',
	},
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
					'https://media.w0s.jp',
					'https://m.media-amazon.com',
					'https://*.ytimg.com',
					'https://pagead2.googlesyndication.com',
					'https://ep1.adtrafficquality.google',
				],
				'media-src': ["'self'", 'https://media.w0s.jp'],
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
			mimeType: {
				path: {
					'/favicon.ico': 'image/svg+xml;charset=utf-8',
				},
				extension: {
					'.atom': 'application/atom+xml;charset=utf-8',
					'.json': 'application/json',
					'.map': 'application/octet-stream',
					'.osdx': 'application/opensearchdescription+xml;charset=utf-8',
					'.pdf': 'application/pdf',
					'.xml': 'application/xml;charset=utf-8',
					'.ttf': 'font/ttf',
					'.woff': 'font/woff',
					'.woff2': 'font/woff2',
					'.jpg': 'image/jpeg',
					'.png': 'image/png',
					'.svg': 'image/svg+xml;charset=utf-8',
					'.webp': 'image/webp',
					'.css': 'text/css;charset=utf-8',
					'.html': 'text/html;charset=utf-8',
					'.js': 'text/javascript;charset=utf-8',
					'.mjs': 'text/javascript;charset=utf-8',
					'.txt': 'text/plain;charset=utf-8',
					'.vtt': 'text/vtt',
				},
			},
			cacheControl: {
				default: 'max-age=600',
				path: [
					{
						paths: ['/favicon.ico'],
						value: 'max-age=604800',
					},
				],
				extension: [
					{
						extensions: ['.webp', '.jpg', '.jpeg', '.png', '.svg'],
						value: 'max-age=3600',
					},
					{
						extensions: ['.webm', '.mp4'],
						value: 'max-age=3600',
					},
					{
						extensions: ['.m4a'],
						value: 'max-age=3600',
					},
					{
						extensions: ['.woff2', '.woff', '.ttf'],
						value: 'max-age=2592000',
					},
					{
						extensions: ['.map'],
						value: 'no-cache',
					},
				],
			},
			sourceMap: {
				extensions: ['.js', '.mjs'],
			},
		},
		authBasic: [
			{
				urls: ['/admin/*'],
				realm: 'Admin',
				htpasswd: 'basic-admin.txt',
			},
			{
				urls: ['/madoka/dojin/pdf/pictorial6/*'],
				realm: 'The Cycle Pictorial 6',
				htpasswd: 'basic-madoka-pictorial6.txt',
			},
			{
				urls: ['/madoka/dojin/pdf/pictorial7/*'],
				realm: 'The Cycle Pictorial 7',
				htpasswd: 'basic-madoka-pictorial7.txt',
			},
			{
				urls: ['/madoka/dojin/pdf/pictorial8/*'],
				realm: 'The Cycle Pictorial 8',
				htpasswd: 'basic-madoka-pictorial8.txt',
			},
			{
				urls: ['/madoka/dojin/pdf/pictorial9/*'],
				realm: 'The Cycle Pictorial 9',
				htpasswd: 'basic-madoka-pictorial9.txt',
			},
			{
				urls: ['/madoka/dojin/pdf/pictorial10/*'],
				realm: 'The Cycle Pictorial 10',
				htpasswd: 'basic-madoka-pictorial10.txt',
			},
		],
	},
	redirect: [
		{
			/* 2013-04-01 実施（恒久維持） */
			from: /^\/sty\/([a-z0-9_/]+)$/,
			to: '/tokyu/machine/$1',
		},
		{
			/* 2013-04-01 実施（恒久維持） */
			from: /^\/an\/([a-z0-9_/]+)$/,
			to: '/tokyu/an/$1',
		},
		{
			/* 2013-04-01 実施（恒久維持） */
			from: '/an',
			to: '/tokyu/an/',
		},
		{
			/* 2018-04-22 実施（恒久維持） */
			from: /^\/madoka-magica\/coterie\/the-cycle-pictorial_([6-8])$/,
			to: '/madoka/dojin/pictorial$1',
		},
		{
			/* 2018-04-22 実施（恒久維持） */
			from: /^\/madoka-magica\/dojin\/pictorial(1?[0-9])$/,
			to: '/madoka/dojin/pictorial$1',
		},
		{
			/* 2021-04-19 実施（恒久維持） */
			from: '/diary/',
			to: 'https://blog.w0s.jp/',
		},
		{
			/* 2021-04-19 実施（恒久維持） */
			from: /^\/diary\/([1-9][0-9]{0,2})$/,
			to: 'https://blog.w0s.jp/entry/$1',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/',
			to: '/tokyu/machine/',
		},
		{
			/* 2024-04-12 実施 */
			from: /^\/tokyu\/sty\/truck_([a-z0-9]+)$/,
			to: '/tokyu/truck/$1',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/aps',
			to: '/tokyu/machine/aps',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/cp',
			to: '/tokyu/machine/cp',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/bce',
			to: '/tokyu/machine/bce',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/bt',
			to: '/tokyu/machine/bt',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/rec',
			to: '/tokyu/machine/rec',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/aci',
			to: '/tokyu/machine/aci',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/usl',
			to: '/tokyu/machine/usl',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/tra',
			to: '/tokyu/machine/tra',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/atc',
			to: '/tokyu/machine/atc',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/pt_7000',
			to: '/tokyu/machine/pt_7000',
		},
		{
			/* 2024-04-12 実施 */
			from: /^\/tokyu\/sty\/ub_([a-z0-9_]+)$/,
			to: '/tokyu/machine/ub_$1',
		},
		{
			/* 2024-04-12 実施 */
			from: /^\/tokyu\/sty\/roof_([a-z0-9]+)$/,
			to: '/tokyu/machine/roof_$1',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/amp_8000',
			to: '/tokyu/yomoyama/8000_amp',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/front_7700',
			to: '/tokyu/yomoyama/7700_front',
		},
		{
			/* 2024-04-12 実施 */
			from: '/tokyu/sty/nosmoking',
			to: '/tokyu/yomoyama/nosmoking',
		},
	],
};
