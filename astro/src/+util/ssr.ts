/**
 * `Astro.url` を元にページ URL を組み立てる
 *
 * @param astroUrl - Astro.url <https://docs.astro.build/en/reference/api-reference/#url>
 * @param astroFilePath - Astro.self.moduleId
 *
 * @returns ページ URL
 */
export const getPageUrl = (astroUrl: URL, astroFilePath: string | undefined): string => {
	const astroPathname = astroUrl.pathname;

	/* build - format: 'preserve' の設定ではビルド時のみ末尾に / が付いてしまうので除去する */
	if (astroFilePath !== undefined && !astroFilePath.endsWith('/index.astro') && astroPathname.endsWith('/')) {
		return astroPathname.slice(0, -1);
	}

	return astroPathname;
};
