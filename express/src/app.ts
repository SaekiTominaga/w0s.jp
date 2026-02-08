import fs from 'node:fs';
import path from 'node:path';
import { loadEnvFile } from 'node:process';
import basicAuth from 'basic-auth';
import compression from 'compression';
import express, { type NextFunction, type Request, type Response } from 'express';
// @ts-expect-error: ts(7016)
import htpasswd from 'htpasswd-js';
import Log4js from 'log4js';
import { env } from '@w0s/env-value-type';
import { escape } from '@w0s/html-escape';
// @ts-expect-error: ts(7016)
import { handler as ssrHandler } from '../../astro/dist/server/entry.mjs';
import config from './config/express.ts';
import { csp, reportingEndpoints } from './util/httpHeader.ts';

loadEnvFile(process.env['NODE_ENV'] === 'production' ? '../.env.production' : '../.env.development');

/* Logger */
Log4js.configure(`${env('ROOT')}/${env('LOG4JS_CONF')}`);
const logger = Log4js.getLogger();

/* Express */
const app = express();

app.set('x-powered-by', false);

/* Redirect */
config.redirect.forEach((redirect) => {
	if (!redirect.to.startsWith('/') && !redirect.to.startsWith('https://') && !redirect.to.startsWith('http://')) {
		throw new Error('The path to the redirect must begin with a U+002F slash');
	}

	app.get(redirect.from, (req, res) => {
		let redirectPath = redirect.to;
		if (redirect.from instanceof RegExp) {
			redirect.from.exec(req.path)?.forEach((value, index) => {
				redirectPath = redirectPath.replace(`$${String(index)}`, value);
			});
		}

		res.status(301).location(redirectPath).send(`<!DOCTYPE html>
<html lang=ja>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>ページ移動</title>
<p>このページは <a href="${escape(redirectPath)}"><code>${escape(redirectPath)}</code></a> に移動しました。`);
	});
});

app.use(
	(_req, res, next) => {
		/* HSTS */
		res.setHeader('Strict-Transport-Security', config.response.header.hsts);

		/* CSP */
		res.setHeader('Content-Security-Policy', csp(config.response.header.csp));

		/* Report */
		res.setHeader('Reporting-Endpoints', reportingEndpoints(config.response.header.reportingEndpoints));

		/* MIME スニッフィング抑止 */
		res.setHeader('X-Content-Type-Options', 'nosniff');

		next();
	},
	compression({
		threshold: config.response.compression.threshold,
	}),
	async (req, res, next) => {
		/* Basic Authentication */
		const basic = config.static.authBasic.find((auth) =>
			auth.pathPatterns.some((pathPattern) =>
				new URLPattern({
					pathname: pathPattern,
				}).test({ pathname: req.url }),
			),
		);
		if (basic !== undefined) {
			const credentials = basicAuth(req);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const result = (await htpasswd.authenticate({
				username: credentials?.name,
				password: credentials?.pass,
				file: `${env('AUTH_DIR')}/${basic.htpasswd}`,
			})) as boolean;

			if (!result) {
				res
					.set('WWW-Authenticate', `Basic realm="${basic.realm}"`)
					.status(401)
					.sendFile(path.resolve(`${config.static.root}/401.html`));

				return;
			}
		}

		next();
	},
	(req, res, next) => {
		const requestPath = req.path;

		let requestFilePath: string | undefined; // 実ファイルパス
		if (requestPath.endsWith('/')) {
			/* ディレクトリトップ（e.g. /foo/ ） */
			const indexPath = `${requestPath}${config.static.index}`;
			if (fs.existsSync(`${config.static.root}${indexPath}`)) {
				requestFilePath = indexPath;
			}
		} else if (path.extname(requestPath) === '') {
			/* 拡張子のない URL（e.g. /foo ） */
			const extension = config.static.extensions.find((ext) => fs.existsSync(`${config.static.root}${requestPath}${ext}`));
			if (extension !== undefined) {
				requestFilePath = `${requestPath}${extension}`;
			}
		} else if (fs.existsSync(`${config.static.root}${requestPath}`)) {
			/* 拡張子のある URL（e.g. /foo.txt ） */
			requestFilePath = requestPath;
		}

		/* Brotli */
		if (requestFilePath !== undefined && req.method === 'GET' && req.acceptsEncodings('br') === 'br') {
			const brotliFilePath = `${requestFilePath}${config.extension.brotli}`;
			if (fs.existsSync(`${config.static.root}${brotliFilePath}`)) {
				req.url = brotliFilePath;
				res.setHeader('Content-Encoding', 'br');
			}
		}

		next();
	},
	express.static(config.static.root, {
		extensions: config.static.extensions.map((ext) => /* 拡張子の . は不要 */ ext.substring(1)),
		index: config.static.index,
		setHeaders: (res, localPath) => {
			const requestUrl = res.req.url; // リクエストパス e.g. ('/foo.html.br')
			const requestUrlOrigin = requestUrl.endsWith(config.extension.brotli)
				? requestUrl.substring(0, requestUrl.length - config.extension.brotli.length)
				: requestUrl; // 元ファイル（圧縮ファイルではない）のリクエストパス (e.g. '/foo.html')
			const localPathOrigin = localPath.endsWith(config.extension.brotli)
				? localPath.substring(0, localPath.length - config.extension.brotli.length)
				: localPath; // 元ファイルの絶対パス (e.g. '/var/www/public/foo.html')
			const extensionOrigin = path.extname(localPathOrigin); // 元ファイルの拡張子 (e.g. '.html')

			/* Content-Type */
			const mimeType =
				Object.entries(config.static.headers.mimeType.path)
					.find(([filePath]) => filePath === requestUrlOrigin)
					?.at(1) ??
				Object.entries(config.static.headers.mimeType.extension)
					.find(([fileExtension]) => fileExtension === extensionOrigin)
					?.at(1);
			if (mimeType === undefined) {
				logger.error(`MIME type is undefined: ${requestUrlOrigin}`);
			}
			res.setHeader('Content-Type', mimeType ?? 'application/octet-stream');

			/* Cache-Control */
			const cacheControl =
				config.static.headers.cacheControl.path.find((ccPath) => ccPath.paths.includes(requestUrlOrigin))?.value ??
				config.static.headers.cacheControl.extension.find((ccExt) => ccExt.extensions.includes(extensionOrigin))?.value ??
				config.static.headers.cacheControl.default;

			res.setHeader('Cache-Control', cacheControl);

			/* SourceMap */
			if (config.static.headers.sourceMap.extensions.includes(extensionOrigin)) {
				const mapFilePath = `${localPathOrigin}${config.extension.map}`;
				if (fs.existsSync(mapFilePath)) {
					res.setHeader('SourceMap', path.basename(mapFilePath));
				}
			}

			/* CSP */
			if (['.html', '.xhtml'].includes(extensionOrigin)) {
				res.setHeader('Content-Security-Policy', csp(config.response.header.cspHtml));
				res.setHeader('Content-Security-Policy-Report-Only', csp(config.response.header.csproHtml));
			}
		},
	}),
);

/* SSR */
app.use(async (req, res, next): Promise<void> => {
	await ssrHandler(req, res, next);
});

/* Error pages */
app.use((req, res): void => {
	logger.warn(`404 Not Found: ${req.method} ${req.url}`);

	res.status(404).sendFile(path.resolve(`${config.static.root}/404.html`));
});
app.use((err: Error, req: Request, res: Response, _next: NextFunction /* eslint-disable-line @typescript-eslint/no-unused-vars */): void => {
	logger.fatal(`${req.method} ${req.url}`, err.stack);

	res.status(500).sendFile(path.resolve(`${config.static.root}/500.html`));
});

/* HTTP Server */
const port = env('EXPRESS_PORT', 'number');
app.listen(port, () => {
	logger.info(`Server is running on http://localhost:${String(port)}`);
});
