interface Entry {
	updated: string;
	content: string;
}

export type Update = Readonly<{
	update: Readonly<{
		entry: readonly Readonly<Entry>[];
	}>;
}>;
