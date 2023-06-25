export default interface BuildComponent {
	/**
	 * Execute the process
	 *
	 * @param args - Arguments passed to the script
	 */
	execute(args: string[]): Promise<void>;
}
