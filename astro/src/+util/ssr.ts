/**
 * `Astro.url` を元にページ URL を組み立てる
 *
 * @param astroUrl - Astro.url <https://docs.astro.build/en/reference/api-reference/#url>
 * @param astroFilePath - Astro.self.moduleId
 *
 * @returns ページ URL
 */
export const getPageUrl = (astroUrl: URL, astroFilePath: string | undefined): string => {
	const pageUrl = astroUrl.pathname.replace(/\.html$/u, '');

	/* build - format: 'preserve' の設定では dev 時のみ末尾の / が付かないので付与する */
	if (astroFilePath?.endsWith('/index.astro') && !pageUrl.endsWith('/')) {
		return `${pageUrl}/`;
	}

	return pageUrl;
};
