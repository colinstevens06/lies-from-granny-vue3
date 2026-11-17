import { vi } from 'vitest';

/**
 * Store specs talk to the server through the band service's fetch, so they stub fetch. (Mocking the band service module
 * instead doesn't work: the service imports dev-auth dynamically, and vitest 0.34 hands concurrent dynamic imports the
 * real module.) Real timers throughout, for the same reason. `path` is relative to /api/band/.
 */
type Handler = (
	path: string,
	method: string
) => { status?: number; body: unknown } | Promise<{ status?: number; body: unknown }>;

export const serve = (handler: Handler) =>
	vi.stubGlobal(
		'fetch',
		vi.fn(async (url: string, init?: { method?: string }) => {
			const { status = 200, body } = await handler(url.replace('/api/band/', ''), init?.method ?? 'GET');
			return { ok: status < 400, status, json: async () => body };
		})
	);

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** A promise and the function that resolves it, to hold a fake response until the test lets it through. */
export const gate = () => {
	let release!: () => void;
	const opened = new Promise<void>(resolve => (release = resolve));
	return { opened, release };
};
