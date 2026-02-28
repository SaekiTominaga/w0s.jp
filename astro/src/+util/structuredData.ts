import dayjs from 'dayjs';
import type { StructuredData, SchemaOrgBreadcrumbList, SchemaOrgBreadcrumbListItem, SchemaOrgPerson, SchemaOrgOrganization } from '../../@types/util.d.ts';

interface Options {
	site: string;
}

interface JsonLd {
	'@context': 'https://schema.org/';
	'@type': string;
	breadcrumb?: SchemaOrgBreadcrumbList;
	dateModified?: string;
	headline: string;
	description?: string;
	image?: string;
	mainEntity?: SchemaOrgPerson | SchemaOrgOrganization;
}

/**
 * JSON-LD 用のデータを構築
 *
 * @param structuredData - ページで指定された構造データ
 * @param options - オプション
 * @param options.site - `import.meta.env.SITE` <https://docs.astro.build/en/guides/environment-variables/#default-environment-variables>
 *
 * @returns JSON-LD データ
 */
export const getJsonLd = (structuredData: Readonly<StructuredData>, options: Readonly<Options>): JsonLd | undefined => {
	if (structuredData.breadcrumb === undefined && structuredData.description === undefined) {
		/* パンくずも Description もないページは JSON-LD を出力する意味合いが薄い */
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

	const jsonLd = {} as JsonLd;
	jsonLd['@context'] = 'https://schema.org/';
	jsonLd['@type'] = structuredData['schema-type'] ?? 'WebPage';
	if (breadcrumbList !== undefined) {
		jsonLd.breadcrumb = breadcrumbList;
	}
	if (structuredData.dateModified !== undefined) {
		jsonLd.dateModified = dayjs(structuredData.dateModified).format('YYYYMMDDTHHmm');
	}
	jsonLd.headline = structuredData.title;
	if (structuredData.description !== undefined) {
		jsonLd.description = structuredData.description;
	}
	if (structuredData.image !== undefined) {
		jsonLd.image = structuredData.image;
	}
	if (structuredData.mainEntity !== undefined) {
		jsonLd.mainEntity = structuredData.mainEntity;
	}

	return jsonLd;
};
