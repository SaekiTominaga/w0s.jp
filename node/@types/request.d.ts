declare namespace ContactRequest {
	interface Input {
		name: string | null;
		email: string | null;
		reply: string | null;
		body: string | null;
		referrer: string | null;
		action_send: boolean;
	}

	interface Completed {
		referrer: string | null;
	}
}

declare namespace TokyuCarHistoryRequest {
	interface Search {
		number: string | null;
		number_old: boolean;
		series: string[];
		register_start: string | null;
		register_end: string | null;
		sort: string | null;
		era: string | null;
		output: string | null;
	}
}

declare namespace MadokaOfficialNewsMonthRequest {
	interface Index {
		month: string | null;
	}

	interface Month {
		month: import('dayjs').Dayjs;
	}
}

declare namespace CrawlerNewsRequest {
	interface Index {
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

	interface Data {
		url: string | null;
		id: string | null;
		action_delete: boolean;
	}
}

declare namespace CrawlerResourceRequest {
	interface Index {
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

	interface Log {
		dir: string | null;
		diff: string[];
	}
}

declare namespace AmazonAdsRequest {
	interface Index {
		asin: string | null;
		category: string[];
		action_add: boolean;
		action_delete: boolean;
	}
}
