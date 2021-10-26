declare namespace AmazonAdsRequest {
	export interface InputQuery {
		asin: string | null;
		category: string[];
		action_add: boolean;
		action_delete: boolean;
	}
}

declare namespace AmazonAdsView {
	export interface Dp {
		asin: string;
		url: string;
		title: string;
		binding: string | null;
		date: import('dayjs').Dayjs | null;
		image_url: string | null;
		image_url_2x: string | null;
	}
}
