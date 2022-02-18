import AmazonAdsController from './controller/AmazonAdsController.js';
import compression from 'compression';
import ContactCompletedController from './controller/ContactCompletedController.js';
import ContactInputController from './controller/ContactInputController.js';
import ContactSendController from './controller/ContactSendController.js';
import CrawlerNewsController from './controller/CrawlerNewsController.js';
import CrawlerNewsDataController from './controller/CrawlerNewsDataController.js';
import CrawlerResourceController from './controller/CrawlerResourceController.js';
import CrawlerResourceLogController from './controller/CrawlerResourceLogController.js';
import Express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import HttpBasicAuth from './util/HttpBasicAuth.js';
import HttpResponse from './util/HttpResponse.js';
import KumetaTwitterController from './controller/KumetaTwitterController.js';
import Log4js from 'log4js';
import MadokaOfficialNewsIndexController from './controller/MadokaOfficialNewsIndexController.js';
import MadokaOfficialNewsMonthController from './controller/MadokaOfficialNewsMonthController.js';
import multer from 'multer';
import path from 'path';
import qs from 'qs';
import TokyuCarHistoryController from './controller/TokyuCarHistoryController.js';
import { W0SJp as Configure } from '../configure/type/common';

/* 設定ファイル読み込み */
const config = <Configure>JSON.parse(fs.readFileSync('node/configure/common.json', 'utf8'));

/* Logger 設定 */
Log4js.configure(config.logger.path);
const logger = Log4js.getLogger();

const app = Express();

const EXTENTIONS = {
	brotli: '.br',
	map: '.map',
}; // 静的ファイル拡張子の定義

app.set('query parser', (query: string) => qs.parse(query, { delimiter: /[&;]/ }));
app.set('trust proxy', true);
app.set('views', config.views);
app.set('view engine', 'ejs');
app.set('x-powered-by', false);

/**
 * リダイレクト
 */
for (const redirect of config.redirect) {
	const fromUrl = redirect.type === 'regexp' ? new RegExp(`^${redirect.from}$`) : redirect.from;
	app.get(fromUrl, (req, res) => {
		let locationUrl = redirect.to;
		if (typeof fromUrl !== 'string') {
			fromUrl.exec(req.path)?.forEach((value, index) => {
				locationUrl = locationUrl.replace(`$${index}`, value);
			});
		}

		new HttpResponse(req, res, config).send301(locationUrl);
	});
}

app.use((req, res, next) => {
	const requestPath = req.path;

	let requestFilePath: string | undefined; // 実ファイルパス
	if (requestPath.endsWith('/')) {
		/* ディレクトリトップ（e.g. /foo/ ） */
		const fileName = config.static.indexes?.find((name) => fs.existsSync(`${config.static.root}/${requestPath}${name}`));
		if (fileName !== undefined) {
			requestFilePath = `${requestPath}${fileName}`;
		}
	} else if (path.extname(requestPath) === '') {
		/* 拡張子のない URL（e.g. /foo ） */
		const extension = config.static.extensions?.find((ext) => fs.existsSync(`${config.static.root}/${requestPath}.${ext}`));
		if (extension !== undefined) {
			requestFilePath = `${requestPath}.${extension}`;
		}
	} else {
		/* 拡張子のある URL（e.g. /foo.txt ） */
		if (fs.existsSync(`${config.static.root}/${requestPath}`)) {
			requestFilePath = requestPath;
		}
	}

	/* Brotli */
	if (requestFilePath !== undefined && req.method === 'GET' && req.acceptsEncodings('br') === 'br') {
		const brotliFilePath = `${requestFilePath}${EXTENTIONS.brotli}`;
		if (fs.existsSync(`${config.static.root}/${brotliFilePath}`)) {
			req.url = brotliFilePath;
			res.setHeader('Content-Encoding', 'br');
		}
	}

	/* HSTS */
	res.setHeader('Strict-Transport-Security', config.response.header.hsts);

	/* CSP */
	if (requestFilePath === undefined || ['.html', '.xhtml'].some((ext) => requestFilePath?.endsWith(ext))) {
		res.setHeader('Content-Security-Policy', config.response.header.csp_html);
		res.setHeader('Content-Security-Policy-Report-Only', config.response.header.cspro_html);
	} else {
		res.setHeader('Content-Security-Policy', config.response.header.csp);
	}

	/* MIME スニッフィング抑止 */
	res.setHeader('X-Content-Type-Options', 'nosniff');

	next();
});
app.use(
	compression({
		threshold: config.response.compression.threshold,
	})
);
app.use(
	Express.urlencoded({
		extended: true,
	})
);
app.use(async (req, res, next) => {
	/* Basic Authentication */
	const basic = config.static.auth_basic?.find((basic) => basic.directory.find((urlPath) => req.url.startsWith(urlPath)));
	if (basic !== undefined) {
		const httpBasicAuth = new HttpBasicAuth(req);
		if (!(await httpBasicAuth.htpasswd(basic.htpasswd))) {
			new HttpResponse(req, res, config).send401('Basic', basic.realm);
			return;
		}
	}

	next();
});
app.use(
	Express.static(config.static.root, {
		extensions: config.static.extensions,
		index: config.static.indexes,
		setHeaders: (res, localPath) => {
			const requestUrl = res.req.url; // リクエストパス e.g. ('/foo.html.br')
			const requestUrlOrigin = requestUrl.endsWith(EXTENTIONS.brotli) ? requestUrl.substring(0, requestUrl.length - EXTENTIONS.brotli.length) : requestUrl; // 元ファイル（圧縮ファイルではない）のリクエストパス (e.g. '/foo.html')
			const localPathOrigin = localPath.endsWith(EXTENTIONS.brotli) ? localPath.substring(0, localPath.length - EXTENTIONS.brotli.length) : localPath; // 元ファイルの絶対パス (e.g. '/var/www/public/foo.html')
			const extensionOrigin = path.extname(localPathOrigin); // 元ファイルの拡張子 (e.g. '.html')

			/* Content-Type */
			const mime =
				Object.entries(config.static.headers.mime.path).find(([, paths]) => paths.includes(requestUrlOrigin))?.[0] ??
				Object.entries(config.static.headers.mime.extension).find(([, extensions]) => extensions.includes(extensionOrigin.substring(1)))?.[0];
			if (mime === undefined) {
				logger.error('MIME が未定義のファイル', requestUrlOrigin);
			}
			res.setHeader('Content-Type', mime ?? 'application/octet-stream');

			/* Cache-Control */
			if (config.static.headers.cache_control !== undefined) {
				const cacheControlValue =
					config.static.headers.cache_control.path.find((path) => path.paths.includes(requestUrlOrigin))?.value ??
					config.static.headers.cache_control.extension.find((ext) => ext.extensions.includes(extensionOrigin))?.value ??
					config.static.headers.cache_control.default;

				res.setHeader('Cache-Control', cacheControlValue);
			}

			/* CORS */
			if (config.static.headers.cors?.directory.find((urlPath) => requestUrl.startsWith(urlPath))) {
				const origin = res.req.get('Origin');
				if (origin !== undefined && config.static.headers.cors?.origin.includes(origin)) {
					res.setHeader('Access-Control-Allow-Origin', origin);
					res.vary('Origin');
				}
			}

			/* SourceMap */
			if (config.static.headers.source_map?.extensions?.includes(extensionOrigin)) {
				const mapFilePath = `${localPathOrigin}${EXTENTIONS.map}`;
				if (fs.existsSync(mapFilePath)) {
					res.setHeader('SourceMap', path.basename(mapFilePath));
				}
			}
		},
	})
);

const upload = multer({ dest: config.temp });

/**
 * 問い合わせ
 */
app
	.route('/contact')
	.get(async (req, res, next) => {
		try {
			await new ContactInputController().execute(req, res);
		} catch (e) {
			next(e);
		}
	})
	.post(async (req, res, next) => {
		try {
			await new ContactSendController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	});
app.get('/contact/completed', async (req, res, next) => {
	try {
		await new ContactCompletedController().execute(req, res);
	} catch (e) {
		next(e);
	}
});

/**
 * ウェブ巡回（ニュース）
 */
app
	.route('/admin/crawler-news')
	.get(async (req, res, next) => {
		try {
			await new CrawlerNewsController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	})
	.post(async (req, res, next) => {
		try {
			await new CrawlerNewsController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	});
app
	.route('/admin/crawler-news/data')
	.get(async (req, res, next) => {
		try {
			await new CrawlerNewsDataController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	})
	.post(async (req, res, next) => {
		try {
			await new CrawlerNewsDataController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	});

/**
 * ウェブ巡回（リソース）
 */
app
	.route('/admin/crawler-resource')
	.get(async (req, res, next) => {
		try {
			await new CrawlerResourceController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	})
	.post(async (req, res, next) => {
		try {
			await new CrawlerResourceController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	});
app.get('/admin/crawler-resource-log', async (req, res, next) => {
	try {
		await new CrawlerResourceLogController().execute(req, res);
	} catch (e) {
		next(e);
	}
});

/**
 * Amazon 商品広告管理
 */
app
	.route('/admin/amazon-ads')
	.get(async (req, res, next) => {
		try {
			await new AmazonAdsController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	})
	.post(async (req, res, next) => {
		try {
			await new AmazonAdsController(config).execute(req, res);
		} catch (e) {
			next(e);
		}
	});

/**
 * 東急電車形態研究・車歴表
 */
app.get('/tokyu/data/history/', async (req, res, next) => {
	try {
		await new TokyuCarHistoryController(config).execute(req, res);
	} catch (e) {
		next(e);
	}
});

/**
 * 久米田康治・Twitter
 */
app.get('/kumeta/twitter', async (req, res, next) => {
	try {
		await new KumetaTwitterController(config).execute(req, res);
	} catch (e) {
		next(e);
	}
});

/**
 * まどか☆マギカ・公式サイトニュース
 */
app.get('/madoka/official/news/', async (req, res, next) => {
	try {
		await new MadokaOfficialNewsIndexController(config).execute(req, res);
	} catch (e) {
		next(e);
	}
});
app.get('/madoka/official/news/:month(20\\d{2}-[0-1]\\d)', async (req, res, next) => {
	try {
		await new MadokaOfficialNewsMonthController(config).execute(req, res);
	} catch (e) {
		next(e);
	}
});

/**
 * エラー処理
 */
app.use((req, res): void => {
	logger.warn(`404 Not Found: ${req.method} ${req.url}`);
	new HttpResponse(req, res, config).send404();
});
app.use((err: Error, req: Request, res: Response, next: NextFunction /* eslint-disable-line @typescript-eslint/no-unused-vars */): void => {
	logger.fatal(`${req.method} ${req.url}`, err.stack);
	new HttpResponse(req, res, config).send500();
});

/**
 * HTTP サーバー起動
 */
app.listen(config.port, () => {
	logger.info(`Example app listening at http://localhost:${config.port}`);
});
