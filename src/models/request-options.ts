export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
	/** False for a caller that treats a 401 as an answer (like "signed out"), so the service's `onUnauthorized` is skipped. */
	handleUnauthorized?: boolean;
}

/**
 * A request body. `object`, not `Record<string, unknown>`: interfaces (the house style for DTOs) have no implicit
 * index signature. Widen deliberately if an endpoint ever needs `FormData`.
 */
export type JsonBody = object;
