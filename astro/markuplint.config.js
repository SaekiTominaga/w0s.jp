/** @type {import('@markuplint/ml-config').Config} */
export default {
	extends: ['../node_modules/@w0s/markuplint-config/.markuplintrc'],
	parser: {
		'\\.astro$': '@markuplint/astro-parser',
	},
	excludeFiles: [
		'src/pages/kumeta/manga/comment.astro',
		'src/pages/kumeta/manga/subtitle.astro',
		'src/pages/madoka/library/magazine.astro',
		'src/pages/madoka/yomoyama/namae.astro',
	],
	rules: {
		'disallowed-element': ['base', 'style', 'hr', 'i', 'u', 'area'],
		'heading-levels': {
			severity: 'warning',
		},
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
			selector: 'nav, aside',
			rules: {
				'landmark-roles': false,
			},
		},
		{
			selector: 'audio',
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
			selector: 'summary',
			rules: {
				'permitted-contents': false,
			},
		},
	],
	pretenders: [
		{
			selector: 'TopUpdate',
			as: 'li',
		},
	],
	overrideMode: 'merge',
	overrides: {
		'**/*.astro': {
			rules: {
				'no-empty-palpable-content': false, // Astro ファイルでエラーが出るため暫定的に無効化
			},
		},
	},
};
