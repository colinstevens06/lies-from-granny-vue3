/** The result of validating a request body: the value, or the machine-readable code the endpoint returns as a 400. */
export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };
