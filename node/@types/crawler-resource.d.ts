declare namespace CrawlerResourceRequest {
	export interface PageQuery {
		url: string | null;
		title: string | null;
		category: number | null;
		priority: number | null;
		browser: boolean;
		selector: string | null;
		action_add: boolean;
		action_revise: boolean;
		action_revise_preview: boolean;
		action_delete: boolean;
	}
}

declare namespace CrawlerResourceView {
	export interface News {
		url: URL;
		title: string;
		priority: string;
		browser: boolean;
		selector: string | null;
		content_length: number;
		last_modified: import('dayjs').Dayjs | null;
	}
}

declare namespace CrawlerResourceLogRequest {
	export interface PageQuery {
		dir: string;
		diff: string[];
	}
}
