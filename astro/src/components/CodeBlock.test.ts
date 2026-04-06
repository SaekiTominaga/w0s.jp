import crypto from 'node:crypto';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse, type Options as ParseOptions } from 'node-html-parser';
import { describe, expect, test } from 'vitest';
// @ts-ignore: ts(2307)
import CodeBlock from './CodeBlock.astro';

const parseOption: ParseOptions = {
	blockTextElements: {
		code: true, // https://github.com/taoqf/node-html-parser/issues/190#issuecomment-1065814436
	},
};

test('base', async () => {
	const codeText = 'foo';

	const container = await AstroContainer.create();
	const result = await container.renderToString(CodeBlock, {
		props: {
			code: codeText,
		},
	});

	const root = parse(result, parseOption);

	const clipboardButton = root.querySelector('.clipboard-button');
	const code = root.querySelector('.code > code');

	const hash = crypto.createHash('md5');
	hash.update(codeText);
	const id = `code-${hash.digest('hex')}`; // コード ID

	expect(clipboardButton?.getAttribute('data-target')).toBe(id);
	expect(code?.id).toBe(id);
	expect(code?.innerHTML).toBe(codeText);
});

describe('language', () => {
	test('xml', async () => {
		const codeText = `
<?xml version="1.0" encoding="utf-8"?>
<element attribute="value"></element>
`;

		const container = await AstroContainer.create();
		const result = await container.renderToString(CodeBlock, {
			props: {
				code: codeText,
				language: 'xml',
			},
		});

		const root = parse(result, parseOption);

		const code = root.querySelector('.code > code');

		expect(code?.innerHTML).toBe(
			`
<span class="hljs-meta">&lt;?xml version=<span class="hljs-string">&quot;1.0&quot;</span> encoding=<span class="hljs-string">&quot;utf-8&quot;</span>?&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">element</span> <span class="hljs-attr">attribute</span>=<span class="hljs-string">&quot;value&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">element</span>&gt;</span>
`,
		);
	});

	test('html', async () => {
		const codeText = `
<!DOCTYPE html>
<p class="className"></p>
`;

		const container = await AstroContainer.create();
		const result = await container.renderToString(CodeBlock, {
			props: {
				code: codeText,
				language: 'html',
			},
		});

		const root = parse(result, parseOption);

		const code = root.querySelector('.code > code');

		expect(code?.innerHTML).toBe(
			`
<span class="hljs-meta">&lt;!DOCTYPE <span class="hljs-keyword">html</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">p</span> <span class="hljs-attr">class</span>=<span class="hljs-string">&quot;className&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">p</span>&gt;</span>
`,
		);
	});

	test('svg', async () => {
		const codeText = `
<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1"></svg>
`;

		const container = await AstroContainer.create();
		const result = await container.renderToString(CodeBlock, {
			props: {
				code: codeText,
				language: 'svg',
			},
		});

		const root = parse(result, parseOption);

		const code = root.querySelector('.code > code');

		expect(code?.innerHTML).toBe(
			`
<span class="hljs-meta">&lt;?xml version=<span class="hljs-string">&quot;1.0&quot;</span> encoding=<span class="hljs-string">&quot;utf-8&quot;</span>?&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">svg</span> <span class="hljs-attr">version</span>=<span class="hljs-string">&quot;1.1&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">svg</span>&gt;</span>
`,
		);
	});

	test('javascript', async () => {
		const codeText = `
const foo = "foo";
`;

		const container = await AstroContainer.create();
		const result = await container.renderToString(CodeBlock, {
			props: {
				code: codeText,
				language: 'javascript',
			},
		});

		const root = parse(result, parseOption);

		const code = root.querySelector('.code > code');

		expect(code?.innerHTML.trim()).toBe(`<span class="hljs-keyword">const</span> foo = <span class="hljs-string">&quot;foo&quot;</span>;`);
	});
});
