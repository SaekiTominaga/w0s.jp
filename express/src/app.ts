import express from 'express';
import qs from 'qs';
// @ts-expect-error: ts(7016)
import { handler as ssrHandler } from '@w0s.jp/astro/dist/server/entry.mjs';

const app = express();

app.set('query parser', (query: string) => qs.parse(query, { delimiter: /[&;]/ }));
app.set('trust proxy', true);
app.set('x-powered-by', false);

app.use((_req, res, next) => {
	/* MIME スニッフィング抑止 */
	res.setHeader('X-Content-Type-Options', 'nosniff');

	next();
});

app.use('/', express.static('../astro/dist/client/'));
app.use((req, res, next) => {
	ssrHandler(req, res, next);
});

/**
 * HTTP サーバー起動
 */
const port = 3001;
app.listen(port, () => {
	console.info(`Example app listening at http://localhost:${port}`);
});
