export type Update = Readonly<{
	update: Readonly<{
		entry: readonly Readonly<{
			updated: string;
			content: string;
		}>[];
	}>;
}>;
