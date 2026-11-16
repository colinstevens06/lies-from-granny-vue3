export class ApiError extends Error {
	constructor(
		readonly status: number,
		/** The server's machine-readable code, or 'network' when there was no response. */
		readonly code: string,
		readonly details: Record<string, unknown> = {}
	) {
		super(code);
	}

	/** True when retrying the same request could succeed: no response, or a 5xx. */
	get retryable() {
		return this.status === 0 || this.status >= 500;
	}
}
