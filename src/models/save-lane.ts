export interface SaveLaneOptions<V, R> {
	/** Quiet time after the last change before a flush. */
	delayMs: number;
	/** Sends one batch. Throw an `ApiError` (or anything with a `status`) on failure. */
	send(entries: [key: string, value: V][]): Promise<R>;
	/** The batch saved. */
	onSaved(entries: [string, V][], result: R): void;
	/** The server refused the batch (a 4xx other than 401), so it was dropped. */
	onRejected(entries: [string, V][]): void;
}
