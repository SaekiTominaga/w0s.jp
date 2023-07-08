declare namespace TokyuCarHistoryView {
	interface Change {
		number: string;
		sign: string;
		date: string;
	}

	interface SearchCar {
		number: string;
		sign: string;
		series: string;
		type: string;
		annual: string;
		register: string;
		change: Change[];
		renewal: string;
		age: number;
		scrap: boolean;
		transfer: string;
	}
}

declare namespace KumetaTwitterView {
	interface Account {
		account: string;
		name: string;
		location: string | null;
		description: string | null;
		url: string | null;
		created: import('dayjs').Dayjs;
	}

	interface ProfileImage {
		regist_date: import('dayjs').Dayjs;
		file_name: string | null;
	}

	interface Banner {
		regist_date: import('dayjs').Dayjs;
		file_name: string | null;
	}
}

declare namespace CrawlerNewsView {
	interface News {
		url: string;
		title: string;
		priority: string;
		browser: boolean;
		selector_wrap: string;
		selector_date: string | null;
		selector_content: string | null;
	}
}

declare namespace CrawlerResourceView {
	interface News {
		url: URL;
		title: string;
		priority: string;
		browser: boolean;
		selector: string | null;
		content_hash: string;
		error: boolean;
	}
}

declare namespace AmazonAdsView {
	interface Dp {
		asin: string;
		url: string;
		title: string;
		binding: string | null;
		date: import('dayjs').Dayjs | null;
		image_url: string | null;
		image_url_2x: string | null;
	}

	interface Json {
		a: string; // ASIN
		t: string; // Title
		b?: string; // Binding
		d?: number; // Date
		i?: string; // Image URL
		w?: number; // Image width
		h?: number; // Image height
	}
}
