// A refusal a function turns into a response. Kept apart from band-db so nothing that only answers HTTP loads the
// database code.

/** `status` with `{ error, ...details }`. */
export interface Failure {
	error: string;
	status: number;
	details?: Record<string, unknown>;
}

export const failure = (status: number, error: string, details?: Record<string, unknown>): Failure => ({
	status,
	error,
	...(details && { details })
});

export const isFailure = (value: unknown): value is Failure =>
	typeof value === 'object' && value !== null && 'error' in value && 'status' in value;
