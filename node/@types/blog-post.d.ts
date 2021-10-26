declare namespace BlogPostRequest {
	export interface InputQuery {
		id: number | null;
		title: string | null;
		description: string | null;
		message: string | null;
		category: string[] | null;
		image: string | null;
		relation: string | null;
		public: boolean;
		timestamp: boolean;
		social: boolean;
		social_tag: string | null;
		action_add: boolean;
		action_revise: boolean;
		action_revise_preview: boolean;
		media_overwrite: boolean;
		action_media: boolean;
	}
}

declare namespace BlogPostView {
	export interface Category {
		id: string;
		name: string;
	}
}

declare namespace BlogPostResponse {
	export interface TopicPost {
		success: boolean;
		message: string;
	}

	export interface MediaUpload {
		success: boolean;
		message: string;
		filename: string;
	}
}

declare namespace BlogPostApi {
	export interface MediaUpload {
		name: string | null;
		size: number | null;
		code: number;
		message: string;
	}
}
