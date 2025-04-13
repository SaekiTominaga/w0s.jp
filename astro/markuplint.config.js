/** @type {import('@markuplint/ml-config').Config} */
export default {
	extends: ['@w0s/markuplint-config'],
	parser: {
		'\\.astro$': '@markuplint/astro-parser',
	},
	excludeFiles: [
		/* markuplint@4.11.4 + @markuplint/astro-parser@4.6.14 で 200KB 超えの巨大なファイルはエラーが出るため暫定的に除外 */
		'src/pages/kumeta/manga/comment.astro', // 258KB
		'src/pages/kumeta/manga/subtitle.astro', // 285KB
		'src/pages/madoka/library/magazine.astro', // 202KB
		'src/pages/madoka/yomoyama/namae.astro', // 308 KB
	],
	rules: {
		'disallowed-element': ['base', 'style', 'h5', 'h6', 'hr', 'i', 'u', 'area'],
		'class-naming': [
			'/^[lcpu]-([a-z][a-z0-9]*)(-[a-z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*){0,2}$/',
			'/^-([a-z][a-z0-9]*)(-[a-z0-9]+)*$/',
			'/^(class|constant|function|language)_$/',
			'/^js-([a-z][a-z0-9]*)(-[a-z0-9]+)*$/',
			'/^adsbygoogle$/',
		],
		'character-reference': false,
	},
	nodeRules: [
		{
			selector: '[id], [class^=js-], .l-content__footer, ins.adsbygoogle',
			rules: {
				'no-empty-palpable-content': false,
			},
		},
		{
			selector: 'table',
			rules: {
				'require-accessible-name': false,
			},
		},
		{
			selector: 'th:has(> DateWareki)',
			rules: {
				'require-accessible-name': false,
			},
		},
		{
			selector: 'summary',
			rules: {
				'permitted-contents': false,
			},
		},
	],
	pretenders: [
		{
			selector: 'Car',
			as: 'td',
		},
		{
			selector: 'CrawlerDiffLine',
			as: 'tr',
		},
		{
			selector: 'ListTable',
			as: 'dl',
		},
		{
			selector: 'Table',
			as: 'table',
		},
	],
	overrideMode: 'merge',
	overrides: {
		/* markuplint@4.11.4 + @markuplint/astro-parser@4.6.14 でエラーが出るため暫定的に無効化 */
		'**/*.astro': {
			rules: {
				'no-empty-palpable-content': false,
			},
		},
		'dist/client/**/*.html': {
			rules: {
				'class-naming': false,
			},
		},
		'src/pages/tokyu/data/history/index.astro': {
			rules: {
				'no-orphaned-end-tag': false,
				'permitted-contents': false,
			},
		},
	},
};
