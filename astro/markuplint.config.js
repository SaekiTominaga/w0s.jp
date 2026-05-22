/** @type {import('@markuplint/ml-config').Config} */
export default {
	extends: ['@w0s/markuplint-config'],
	parser: {
		'\\.astro$': '@markuplint/astro-parser',
	},
	excludeFiles: [
		'src/components/EmbeddedYouTube.astro', // style 属性値の中に '/' が含まれいるためパースエラーになる

		/* markuplint@4.13.1 + @markuplint/astro-parser@4.6.21 で巨大なファイルはエラーが出るため暫定的に除外 */
		'src/pages/kumeta/library/book.astro', // 165 KB
		'src/pages/kumeta/library/manga.astro', // 177 KB
		'src/pages/kumeta/manga/comment.astro', // 251 KB
		'src/pages/kumeta/manga/subtitle.astro', // 286 KB
		'src/pages/madoka/library/magazine.astro', // 202 KB
		'src/pages/madoka/yomoyama/namae.astro', // 287 KB
	],
	rules: {
		'character-reference': false,
		'no-empty-palpable-content': false,
	},
	nodeRules: [
		{
			selector: 'table',
			rules: {
				'require-accessible-name': false,
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
			selector: 'DateWareki',
			as: {
				element: 'time',
				attrs: [
					{
						name: 'datetime',
						value: '2000-01-01',
					},
				],
				aria: {
					name: {
						fromAttr: 'value',
					},
				},
			},
		},
		{
			selector: 'Head',
			as: 'head',
		},
		{
			selector: 'ListDescription',
			as: 'dl',
		},
		{
			selector: 'Label',
			as: 'label',
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
		'dist/client/**/*.html': {
			rules: {
				'class-naming': false,
			},
		},
		'src/components/**/*.astro': {
			rules: {
				'class-naming': ['/^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/'],
				'disallowed-element': ['base', 'hr', 'i', 'u', 'area'],
				'heading-levels': false,
			},
			nodeRules: [],
		},
		'src/components/TopNavCard.astro': {
			nodeRules: [
				{
					selector: '.list',
					rules: {
						'wai-aria': false, // set:html を使っているため中身が空
					},
				},
			],
		},
		'src/components/Embedded.astro': {
			nodeRules: [
				{
					selector: 'figure',
					rules: {
						'permitted-contents': false,
					},
				},
			],
		},
		'src/components/VideoDiffItem.astro': {
			nodeRules: [
				{
					selector: 'div',
					rules: {
						'permitted-contents': false,
						'required-attr': false,
					},
				},
			],
		},
		'src/layouts/*.astro': {
			nodeRules: [
				{
					selector: 'head',
					rules: {
						'permitted-contents': false, // コンポーネントの関係で title 要素がないと言われるため
					},
				},
			],
		},
		'src/pages/**/*.astro': {
			rules: {
				'class-naming': [
					'/^[lcpu]-([a-z][a-z0-9]*)(-[a-z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*){0,2}$/',
					'/^-([a-z][a-z0-9]*)(-[a-z0-9]+)*$/',
					'/^js-([a-z][a-z0-9]*)(-[a-z0-9]+)*$/',
				],
				'disallowed-element': ['base', 'style', 'h1', 'hr', 'i', 'u', 'area'],
			},
		},
	},
};
