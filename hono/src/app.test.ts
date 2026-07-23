import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { env } from '@w0s/env-value-type';
import app from './app.ts';
import { getAuthFile } from './util/auth.ts';

await test('redirect', async (t) => {
	await t.test('string', async () => {
		const res = await app.request('/an');

		assert.equal(res.status, 301);
		assert.equal(res.headers.get('Content-Type'), 'text/html; charset=UTF-8');
		assert.equal(res.headers.get('Location'), '/tokyu/an/');
	});

	await t.test('RegExp', async () => {
		const res = await app.request('/diary/1');

		assert.equal(res.status, 301);
		assert.equal(res.headers.get('Content-Type'), 'text/html; charset=UTF-8');
		assert.equal(res.headers.get('Location'), 'https://blog.w0s.jp/entry/1');
	});
});

await test('Compress', async (t) => {
	await t.test('No Brotli static file', async (t2) => {
		await t2.test('no compression', async () => {
			assert.equal((await app.request('sitemap.xml', { headers: { 'Accept-Encoding': 'br' } })).headers.get('Content-Encoding'), null);
		});

		await t2.test('gzip', async () => {
			assert.equal((await app.request('sitemap.xml', { headers: { 'Accept-Encoding': 'gzip, deflate, br, zstd' } })).headers.get('Content-Encoding'), 'gzip');
		});
	});

	await t.test('Brotli static file', async (t3) => {
		await t3.test('no compression', async () => {
			assert.equal((await app.request('/.well-known/feed-menu.json')).headers.get('Content-Encoding'), null);
		});

		await t3.test('gzip', async () => {
			assert.equal(
				(await app.request('/.well-known/feed-menu.json', { headers: { 'Accept-Encoding': 'gzip, deflate, zstd' } })).headers.get('Content-Encoding'),
				'gzip',
			);
		});

		await t3.test('br', async () => {
			assert.equal(
				(await app.request('/.well-known/feed-menu.json', { headers: { 'Accept-Encoding': 'gzip, deflate, br, zstd' } })).headers.get('Content-Encoding'),
				'br',
			);
		});
	});
});

await test('headers', async () => {
	const res = await app.request('/robots.txt');

	assert.equal(res.headers.get('Strict-Transport-Security'), 'max-age=31536000');
	assert.equal(res.headers.get('Content-Security-Policy'), "frame-ancestors 'self';report-uri https://report.w0s.jp/report/csp;report-to default");
	assert.equal(res.headers.get('Reporting-Endpoints'), 'default="https://report.w0s.jp/report/csp"');
	assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
});

await test('Auth', async (t) => {
	await t.test('No authorization', async () => {
		const res = await app.request('/admin/');

		assert.equal(res.status, 401);
		assert.equal(res.headers.get('WWW-Authenticate'), 'Basic realm="Admin"');
	});

	await t.test('Missing username or password', async () => {
		const username = 'user0123';
		const password = 'password0123';

		const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

		const res = await app.request('/admin/', {
			headers: { Authorization: authorization },
		});

		assert.equal(res.status, 401);
		assert.equal(res.headers.get('WWW-Authenticate'), 'Basic realm="Admin"');
	});

	await t.test('Success', async () => {
		const credentials = (await getAuthFile(`${env('ROOT')}/${env('AUTH_DIR')}/${env('AUTH_FILE_ADMIN')}`)).at(0);
		const authorization = `Basic ${Buffer.from(`${String(credentials?.username)}:${String(credentials?.password.orig)}`).toString('base64')}`;

		const res = await app.request('/admin/', {
			headers: { Authorization: authorization },
		});

		assert.equal(res.status, 200);
	});
});

await test('serveStatic', async (t) => {
	await t.test('no extension', async () => {
		assert.equal((await app.request('/tokyu/data/history_mekama&toyoko_passenger')).status, 200);
	});

	await t.test('Content-Type', async (t2) => {
		await t2.test('hono default', async () => {
			assert.equal((await app.request('/sitemap.xml')).headers.get('Content-Type'), 'application/xml; charset=utf-8');
		});

		await t2.test('path', async () => {
			assert.equal((await app.request('/favicon.ico')).headers.get('Content-Type'), 'image/x-icon'); // TODO: 本来は image/svg+xml; charset=utf-8（実際は後者が正しく送信される）
		});

		await t2.test('extension', async () => {
			assert.equal((await app.request('/tokyu/feed')).headers.get('Content-Type'), 'application/octet-stream'); // TODO: 本来は application/atom+xml; charset=utf-8（実際は後者が正しく送信される）
		});
	});

	await t.test('Cache-Control', async (t2) => {
		await t2.test('default', async () => {
			assert.equal((await app.request('/robots.txt')).headers.get('Cache-Control'), 'max-age=600');
		});

		await t2.test('path', async () => {
			assert.equal((await app.request('/favicon.ico')).headers.get('Cache-Control'), 'max-age=604800');
		});

		await t2.test('extension', async () => {
			assert.equal((await app.request('/apple-touch-icon.png')).headers.get('Cache-Control'), 'max-age=3600');
		});
	});

	await t.test('SourceMap', async () => {
		assert.equal((await app.request('/assets/script/w0s.mjs')).headers.get('SourceMap'), 'w0s.mjs.map');
	});

	await t.test('CSP', async () => {
		const res = await app.request('/');

		assert.equal(
			res.headers.get('Content-Security-Policy'),
			"base-uri 'none';form-action 'self' https://www.google.com;frame-ancestors 'self';report-uri https://report.w0s.jp/report/csp;report-to default",
		);
		assert.equal(
			res.headers.get('Content-Security-Policy-Report-Only'),
			"default-src 'self';connect-src 'self' https://*.w0s.jp https://pagead2.googlesyndication.com https://csi.gstatic.com https://ep1.adtrafficquality.google;font-src 'self' data:;frame-src 'self' https://www.youtube-nocookie.com https://www.google.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://ep2.adtrafficquality.google;img-src 'self' data: https://m.media-amazon.com https://*.ytimg.com https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google;media-src 'self';script-src-elem 'self' https://analytics.w0s.jp https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://ep2.adtrafficquality.google;style-src 'self' 'unsafe-inline';trusted-types default goog#html google#safe 'allow-duplicates';require-trusted-types-for 'script';report-uri https://report.w0s.jp/report/csp;report-to default",
		);
	});
});
