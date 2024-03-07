import type { StructuredData, SchemaOrgBreadcrumbList, SchemaOrgBreadcrumbListItem } from '@type/types.js';

interface Options {
	site: string;
}

export default class StructuredDataUtil {
	/**
	 * JSON-LD 用のデータを構築
	 *
	 * @param structuredData - ページで指定された構造データ
	 * @param options - オプション
	 * @param options.site - `import.meta.env.SITE` <https://docs.astro.build/en/guides/environment-variables/#default-environment-variables>
	 *
	 * @returns JSON-LD データ
	 */
	static getJsonLd = (structuredData: StructuredData, options: Options): object | undefined => {
		if (structuredData.breadcrumb === undefined && structuredData.description === undefined) {
			/* パンくずも description もないページは JSON-LD を出力する意味合いが薄い */
			return undefined;
		}

		/* パンくず */
		let breadcrumbList: SchemaOrgBreadcrumbList | undefined;
		if (structuredData.breadcrumb !== undefined) {
			const breadcrumbItemList = structuredData.breadcrumb.map((item, index) => {
				const listItem: SchemaOrgBreadcrumbListItem = {
					'@type': 'ListItem',
					position: index + 1,
					name: item.name,
					item: `${options.site}${item.path}`, // 絶対 URL 化
				};
				return listItem;
			});
			breadcrumbItemList.push({
				'@type': 'ListItem',
				position: breadcrumbItemList.length + 1,
				name: structuredData.title,
			}); // 最後に現在ページを追加

			breadcrumbList = {
				'@type': 'BreadcrumbList',
				itemListElement: breadcrumbItemList,
			};
		}

		const webPage = new Map<string, string | string[] | object>([
			['@context', 'https://schema.org/'],
			['@type', structuredData['schema-type'] ?? 'WebPage'],
		]);
		if (breadcrumbList !== undefined) {
			webPage.set('breadcrumb', breadcrumbList);
		}
		if (structuredData.dateModified !== undefined) {
			webPage.set('dateModified', structuredData.dateModified.format('YYYY-MM-DD'));
		}
		webPage.set('headline', structuredData.title);
		if (structuredData.description !== undefined) {
			webPage.set('description', structuredData.description);
		}
		if (structuredData.image !== undefined) {
			webPage.set('image', structuredData.image);
		}
		if (structuredData.mainEntity !== undefined) {
			webPage.set('mainEntity', structuredData.mainEntity);
		}

		return Object.fromEntries(webPage);
	};
}
