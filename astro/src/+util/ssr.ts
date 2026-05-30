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

	if (astroFilePath !== undefined) {
		/* build - format: 'preserve' の設定では dev 時のみ末尾の / が付かないので付与する */
		if (astroFilePath.endsWith('/index.astro') && !astroPathname.endsWith('/')) {
			return `${astroPathname}/`;
		}

		/* build - format: 'preserve' の設定では build 時のみ末尾に / が付いてしまうので除去する */
		if (!astroFilePath.endsWith('/index.astro') && astroPathname.endsWith('/')) {
			return astroPathname.slice(0, -1);
		}
	}

	return astroPathname;
};
