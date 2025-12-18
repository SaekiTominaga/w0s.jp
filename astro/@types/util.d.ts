import { Dayjs } from 'dayjs';

export type SchemaOrgBreadcrumbListItem = Readonly<{
	'@context'?: string;
	'@type': 'ListItem';
	position: number;
	name: string;
	item?: string;
}>; // https://schema.org/ListItem; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb#list-item

export type SchemaOrgBreadcrumbList = Readonly<{
	'@context'?: string;
	'@type': 'BreadcrumbList';
	itemListElement: readonly SchemaOrgBreadcrumbListItem[];
}>; // https://schema.org/BreadcrumbList; https://developers.google.com/search/docs/appearance/structured-data/breadcrumb#breadcrumb-list

export type SchemaOrgPerson = Readonly<{
	'@type': 'Person';
	name: string;
	agentInteractionStatistic?: Readonly<object>;
	alternateName?: string;
	description?: string;
	identifier?: string;
	image?: string | readonly string[] | Readonly<object>;
	interactionStatistic?: Readonly<object>;
	sameAs?: string;
}>; // https://schema.org/Person; https://developers.google.com/search/docs/appearance/structured-data/profile-page#profile-target-specification

export type SchemaOrgOrganization = Readonly<{
	'@type': 'Organization';
	name: string;
	agentInteractionStatistic?: Readonly<object>;
	alternateName?: string;
	description?: string;
	identifier?: string;
	image?: string | readonly string[] | Readonly<object>;
	interactionStatistic?: Readonly<object>;
	sameAs?: string;
}>; // https://schema.org/Person; https://developers.google.com/search/docs/appearance/structured-data/profile-page#profile-target-specification

export type StructuredDataErrorPage = Readonly<{
	heading: string;
	headingCode: string;
	moduleScripts?: readonly string[];
}>;

export type StructuredDataUrl = Readonly<{
	path: string;
	name: string;
}>;

export type StructuredData = Readonly<{
	type?: 'website' | 'article' /* default */ | 'profile'; // OGP: music, video, article, book, profile, website <https://ogp.me/#types>
	'schema-type'?:
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
	title: string;
	heading?: string;
	subHeading?: string;
	dateModified?: Dayjs;
	description?: string;
	image?: string;
	breadcrumb?: readonly StructuredDataUrl[];
	localNav?: Readonly<{
		label: string;
		items: readonly StructuredDataUrl[];
	}>;
	tocDirection?: 'column' | 'row';
	moduleScripts?: readonly string[];
	mainEntity?: SchemaOrgPerson | SchemaOrgOrganization;
	opensearch?: StructuredDataUrl;
}>;
