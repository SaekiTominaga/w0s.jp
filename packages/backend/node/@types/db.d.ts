declare namespace Amazon {
	interface CategoryMaster {
		id: string;
		name: string;
		json_name: string;
		sort: number;
	}

	interface DpData {
		asin: string;
		url: string;
		title: string;
		binding: string | null;
		date: Date | null;
		image_url: string | null;
		image_width: number | null;
		image_height: number | null;
	}

	interface CategoryData {
		asin: string;
		category_id: string;
	}
}
