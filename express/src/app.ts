import fs from 'node:fs';
import path from 'node:path';
import basicAuth from 'basic-auth';
import compression from 'compression';
import express, { type NextFunction, type Request, type Response } from 'express';
// @ts-expect-error: ts(7016)
import htpasswd from 'htpasswd-js';
import { isMatch } from 'matcher';
import HtmlEscape from '@w0s/html-escape';
// @ts-expect-error: ts(7016)
import { handler as ssrHandler } from '@w0s.jp/astro/dist/server/entry.mjs';
import type { Express as Configure } from '../../configure/type/express.js';

/* 設定ファイル読み込み */
const config = JSON.parse((await fs.promises.readFile('../configure/express.json')).toString()) as Configure;

const app = express();

app.set('x-powered-by', false);

/**
 * リダイレクト
 */
config.redirect.forEach((redirect) => {
	const fromUrl = redirect.type === 'regexp' ? new RegExp(`^${redirect.from}$`) : redirect.from;
	app.get(fromUrl, (req, res) => {
		let locationUrl = redirect.to;
		if (typeof fromUrl !== 'string') {
			fromUrl.exec(req.path)?.forEach((value, index) => {
				locationUrl = locationUrl.replace(`$${String(index)}`, value);
			});
		}

		const locationUrlEscapedHtml = HtmlEscape.escape(locationUrl);

		res.status(301).location(locationUrl).send(`<!doctype html>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>Moved Permanently</title>
<h1>301 Moved Permanently</h1>
<p><a href="${locationUrlEscapedHtml}">${locationUrlEscapedHtml}</a>`);
	});
});

app.use(
	(_req, res, next) => {
		/* HSTS */
		res.setHeader('Strict-Transport-Security', config.response.header.hsts);

		/* CSP */
		res.setHeader('Content-Security-Policy', config.response.header.csp);

		/* Report */
		res.setHeader(
			'Reporting-Endpoints',
			Object.entries(config.response.header.reporting_endpoints)
				.map((endpoint) => `${endpoint.at(0) ?? ''}="${endpoint.at(1) ?? ''}"`)
				.join(','),
		);

		/* MIME スニッフィング抑止 */
		res.setHeader('X-Content-Type-Options', 'nosniff');

		next();
	},
	compression({
		threshold: config.response.compression.threshold,
	}),
	async (req, res, next) => {
		/* Basic Authentication */
		const basic = config.static.auth_basic?.find((auth) => isMatch(req.url, auth.urls));
		if (basic !== undefined) {
			const credentials = basicAuth(req);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const result = (await htpasswd.authenticate({
				username: credentials?.name,
				password: credentials?.pass,
				file: basic.htpasswd,
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
			const fileName = config.static.indexes?.find((name) => fs.existsSync(`${config.static.root}${requestPath}${name}`));
			if (fileName !== undefined) {
				requestFilePath = `${requestPath}${fileName}`;
			}
		} else if (path.extname(requestPath) === '') {
			/* 拡張子のない URL（e.g. /foo ） */
			const extension = config.static.extensions?.find((ext) => fs.existsSync(`${config.static.root}${requestPath}${ext}`));
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
		extensions: config.static.extensions?.map((ext) => /* 拡張子の . は不要 */ ext.substring(1)),
		index: config.static.indexes,
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
				Object.entries(config.static.headers.mime_type.path)
					.find(([filePath]) => filePath === requestUrlOrigin)
					?.at(1) ??
				Object.entries(config.static.headers.mime_type.extension)
					.find(([fileExtension]) => fileExtension === extensionOrigin)
					?.at(1);
			if (mimeType === undefined) {
				console.warn(`MIME type is undefined: ${requestUrlOrigin}`);
			}
			res.setHeader('Content-Type', mimeType ?? 'application/octet-stream');

			/* Cache-Control */
			if (config.static.headers.cache_control !== undefined) {
				const cacheControl =
					config.static.headers.cache_control.path.find((ccPath) => ccPath.paths.includes(requestUrlOrigin))?.value ??
					config.static.headers.cache_control.extension.find((ccExt) => ccExt.extensions.includes(extensionOrigin))?.value ??
					config.static.headers.cache_control.default;

				res.setHeader('Cache-Control', cacheControl);
			}

			/* CORS */
			if (config.static.headers.cors?.directory.find((urlPath) => requestUrl.startsWith(urlPath)) !== undefined) {
				const origin = res.req.get('Origin');
				if (origin !== undefined && config.static.headers.cors.origin.includes(origin)) {
					res.setHeader('Access-Control-Allow-Origin', origin);
					res.vary('Origin');
				}
			}

			/* SourceMap */
			if (config.static.headers.source_map?.extensions?.includes(extensionOrigin)) {
				const mapFilePath = `${localPathOrigin}${config.extension.map}`;
				if (fs.existsSync(mapFilePath)) {
					res.setHeader('SourceMap', path.basename(mapFilePath));
				}
			}

			/* CSP */
			if (['.html', '.xhtml'].includes(extensionOrigin)) {
				res.setHeader('Content-Security-Policy', config.response.header.csp_html);
				res.setHeader('Content-Security-Policy-Report-Only', config.response.header.cspro_html);
			}
		},
	}),
);

/**
 * SSR
 */
app.use(async (req, res, next): Promise<void> => {
	await ssrHandler(req, res, next);
});

/**
 * エラー処理
 */
app.use((req, res): void => {
	console.warn(`404 Not Found: ${req.method} ${req.url}`);

	res.status(404).sendFile(path.resolve(`${config.static.root}/404.html`));
});
app.use((err: Error, req: Request, res: Response, _next: NextFunction /* eslint-disable-line @typescript-eslint/no-unused-vars */): void => {
	console.error(`${req.method} ${req.url}`, err.stack);

	res.status(500).sendFile(path.resolve(`${config.static.root}/500.html`));
});

/**
 * HTTP サーバー起動
 */
app.listen(config.port, () => {
	console.info(`Example app listening at http://localhost:${String(config.port)}`);
});
