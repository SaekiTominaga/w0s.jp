import { HTTPException } from 'hono/http-exception';
import { validator } from 'hono/validator';

/**
 * 検索
 */

const SITE = ['www', 'blog'] as const;
type Site = (typeof SITE)[number];

const ENGINE = ['google', 'bing', 'yahoo', 'ddg'] as const;
type Engine = (typeof ENGINE)[number];

interface RequestQuery {
	site: Site;
	engine: Engine;
	q: string;
}

const param = validator('query', (value): RequestQuery => {
	const { site, engine, q } = value;

	if (site !== undefined) {
		if (typeof site !== 'string' || !(SITE as readonly string[]).includes(site)) {
			throw new HTTPException(400, { message: 'The `site` parameter is invalid' });
		}
	}

	if (engine === undefined) {
		throw new HTTPException(400, { message: 'The `engine` parameter is required' });
	}
	if (typeof engine !== 'string' || !(ENGINE as readonly string[]).includes(engine)) {
		throw new HTTPException(400, { message: 'The `engine` parameter is invalid' });
	}

	if (q === undefined) {
		throw new HTTPException(400, { message: 'The `q` parameter is required' });
	}
	if (typeof q !== 'string') {
		throw new HTTPException(400, { message: 'The `q` parameter is invalid' });
	}

	return {
		site: (site as Site | undefined) ?? 'www',
		engine: engine as Engine,
		q: q,
	};
});

export { type Site, type Engine, param };
