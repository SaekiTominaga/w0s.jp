declare namespace TokyuCarHistoryRequest {
	export interface Query {
		number: string | null;
		number_old: boolean;
		series: string[] | null;
		register_start: string | null;
		register_end: string | null;
		sort: string | null;
		era: string | null;
		output: string | null;
	}
}

declare namespace TokyuCarHistoryView {
	export interface SearchCar {
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

	export interface Change {
		number: string;
		sign: string;
		date: string;
	}
}
