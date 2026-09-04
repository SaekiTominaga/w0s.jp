/** @type {string[]} */
const restrictedElements = ['noscript', 'embed', 'base', 'style', 'h5', 'h6', 'hr', 'i', 'u', 'area'];

/** @type {import('@markuplint/ml-config').Config} */
export default {
	extends: ['@w0s/markuplint-config'],
	parser: {
		'\\.astro$': '@markuplint/astro-parser',
	},
	excludeFiles: [
		'src/components/EmbeddedYouTube.astro', // style 属性値の中に '/' が含まれいるためパースエラーになる

		/* markuplint@5.0.0-rc.7 + @markuplint/astro-parser@5.0.0-rc.7 で巨大なファイルはエラーが出るため暫定的に除外 */
		'src/pages/madoka/yomoyama/namae.astro', // 285 KB
		'src/pages/kumeta/manga/subtitle.astro', // 276 KB
		'src/pages/kumeta/manga/comment.astro', // 250 KB
		'src/pages/madoka/library/magazine.astro', // 201 KB
		'src/pages/kumeta/library/manga.astro', // 189 KB
		'src/pages/kumeta/library/book.astro', // 175 KB
	],
	rules: {
		'no-restricted-element': restrictedElements,
		'class-naming': [
			'/^[lcpu]-([a-z][a-z0-9]*)(-[a-z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*){0,2}$/',
			'/^-([a-z][a-z0-9]*)(-[a-z0-9]+)*$/',
			'/^(class|constant|function|language)_$/',
			'/^js-([a-z][a-z0-9]*)(-[a-z0-9]+)*$/',
			'/^adsbygoogle$/',
		],
	},
	nodeRules: [
		{
			selector: '[id], ins.adsbygoogle',
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
			selector: 'button > svg[role="img"]',
			rules: {
				'no-aria-on-presentational-children': false,
			},
		},
		{
			selector: 'summary',
			rules: {
				'permitted-contents': false,
			},
		},
		{
			selector: '.item-container .link > a[aria-labelledby]',
			rules: {
				'no-redundant-accessible-name': false,
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
		{
			selector: 'IndexTable',
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
		'src/**/*.astro': {
			rules: {
				'no-unescaped-char': false, // 属性値のエスケープが format で解除されてしまうため
				'no-empty-palpable-content': false, // `set:html` による中身が空状態を許容
				'no-restricted-element': restrictedElements.filter((name) => name !== 'style'), // `<style>` 要素を許容
			},
		},
		'src/components/**/*.astro': {
			rules: {
				'no-empty-table-track': false, // `<slot>` 要素を許容
				'permitted-contents': false, // `<slot>` 要素を許容
				'require-owned-elements': false, // `set:html` による中身が空状態を許容
				'class-naming': ['/^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/'],
			},
		},
		'src/components/VideoDiffItem.astro': {
			nodeRules: [
				{
					selector: 'div',
					rules: {
						'require-attr': false, // `<dl>` 直下の `<div>` は属性なしを許容
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
		'src/layouts/content-body/Top.astro': {
			rules: {
				'class-naming': ['/^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/'], // TODO: これはコンポーネントでは?
			},
		},
		'src/pages/**/*.astro': {
			rules: {
				'class-naming': [
					'/^[lcpu]-([a-z][a-z0-9]*)(-[a-z0-9]+)*(?:__[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)?(?:--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*){0,2}$/',
					'/^-([a-z][a-z0-9]*)(-[a-z0-9]+)*$/',
					'/^js-([a-z][a-z0-9]*)(-[a-z0-9]+)*$/',
				],
				'no-restricted-element': [...restrictedElements, 'h1'],
			},
		},
	},
};
