export interface SchemaOrgBreadcrumbListItem {
	readonly '@context'?: string;
	readonly '@type': 'ListItem';
	readonly position: number;
	readonly name: string;
	readonly item?: string;
} // https://schema.org/ListItem; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb#list-item

export interface SchemaOrgBreadcrumbList {
	readonly '@context'?: string;
	readonly '@type': 'BreadcrumbList';
	readonly itemListElement: SchemaOrgBreadcrumbListItem[];
} // https://schema.org/BreadcrumbList; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb#breadcrumb-list

export interface SchemaOrgPerson {
	readonly '@type': 'Person';
	readonly name: string;
	readonly agentInteractionStatistic?: object;
	readonly alternateName?: string;
	readonly description?: string;
	readonly identifier?: string;
	readonly image?: string | string[] | object;
	readonly interactionStatistic?: object;
	readonly sameAs?: string;
} // https://schema.org/Person; https://developers.google.com/search/docs/appearance/structured-data/profile-page#profile-target-specification

export interface SchemaOrgOrganization {
	readonly '@type': 'Organization';
	readonly name: string;
	readonly agentInteractionStatistic?: object;
	readonly alternateName?: string;
	readonly description?: string;
	readonly identifier?: string;
	readonly image?: string | string[] | object;
	readonly interactionStatistic?: object;
	readonly sameAs?: string;
} // https://schema.org/Person; https://developers.google.com/search/docs/appearance/structured-data/profile-page#profile-target-specification

export interface StructuredDataErrorPage {
	readonly heading: string;
	readonly headingCode: string;
	readonly moduleScripts?: string[];
}

export interface StructuredDataUrl {
	readonly path: string;
	readonly name: string;
}

export interface StructuredData {
	readonly type?: 'website' | 'article' /* default */ | 'profile'; // OGP: music, video, article, book, profile, website <https://ogp.me/#types>
	readonly 'schema-type'?:
		| 'WebPage' /* default */
		| 'AboutPage'
		| 'CheckoutPage'
		| 'CollectionPage'
		| 'ContactPage'
		| 'FAQPage'
		| 'ItemPage'
		| 'MedicalWebPage'
		| 'ProfilePage'
		| 'QAPage'
		| 'RealEstateListing'
		| 'SearchResultsPage'; // https://schema.org/docs/full.html
	readonly title: string;
	readonly heading?: string;
	readonly subHeading?: string;
	readonly dateModified?: import('dayjs').Dayjs;
	readonly description?: string;
	readonly image?: string;
	readonly breadcrumb?: StructuredDataUrl[];
	readonly localNav?: {
		label: string;
		items: StructuredDataUrl[];
	};
	readonly tocDirection?: 'column' | 'row';
	readonly moduleScripts?: string[];
	readonly mainEntity?: SchemaOrgPerson | SchemaOrgOrganization;
	readonly opensearch?: StructuredDataUrl;
}
