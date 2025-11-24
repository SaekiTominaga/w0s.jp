export interface Entry {
	updated: string;
	content: string;
}

export interface Update {
	update: Readonly<{
		entry: readonly Readonly<Entry>[];
	}>;
}
