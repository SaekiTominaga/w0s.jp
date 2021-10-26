declare namespace ContactRequest {
	export interface InputQuery {
		name: string | null;
		email: string | null;
		reply: string | null;
		body: string | null;
		referrer: string | null;
		action_send: boolean;
	}

	export interface CompletedQuery {
		referrer: string | null;
	}
}
