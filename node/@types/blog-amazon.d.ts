declare namespace BlogAmazonRequest {
	export interface InputQuery {
		asin: string | null;
		action_delete: boolean;
	}
}

declare namespace BlogAmazonView {
	export interface Category {
		id: string;
		name: string;
	}
}
