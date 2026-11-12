/** The result of validating a request body: the value, or the machine-readable code the endpoint returns as a 400. */
export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export const parsed = <T>(value: T): Parsed<T> => ({ ok: true, value });

export const rejected = (error: string): Parsed<never> => ({ ok: false, error });

export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
