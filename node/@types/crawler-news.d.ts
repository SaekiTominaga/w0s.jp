declare namespace CrawlerNewsRequest {
	export interface PageQuery {
		url: string | null;
		title: string | null;
		category: number | null;
		priority: number | null;
		browser: boolean;
		selector_wrap: string | null;
		selector_date: string | null;
		selector_content: string | null;
		action_add: boolean;
		action_revise: boolean;
		action_revise_preview: boolean;
		action_delete: boolean;
	}

	export interface DataQuery {
		url: string | null;
		id: string | null;
		action_delete: boolean;
	}
}

declare namespace CrawlerNewsView {
	export interface News {
		url: string;
		title: string;
		priority: string;
		browser: boolean;
		selector_wrap: string;
		selector_date: string | null;
		selector_content: string | null;
	}
}
