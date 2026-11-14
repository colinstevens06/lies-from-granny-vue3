// The only `fetch` for /api/band/*. Sends JSON (`{}` for a body-less POST) and sends a 401 to the login page.

export class BandApiError extends Error {
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

interface Options {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
	body?: unknown;
	/** loadMe handles its own 401. */
	redirectOn401?: boolean;
}

/** Local testing only: in a production build `import.meta.env.DEV` is false, so the import below is dropped. */
const localTestingHeaders = async (): Promise<Record<string, string>> => {
	if (!import.meta.env.DEV) return {};

	return (await import('./dev-auth')).devHeaders();
};

export const bandApi = async <T>(
	path: string,
	{ method = 'GET', body, redirectOn401 = true }: Options = {}
): Promise<T> => {
	let response: Response;
	try {
		response = await fetch(`/api/band/${path}`, {
			method,
			credentials: 'same-origin',
			headers: {
				...(method === 'GET' ? {} : { 'content-type': 'application/json' }),
				// Local testing only: removed from production builds along with dev-auth.
				...(await localTestingHeaders())
			},
			body: method === 'GET' ? undefined : JSON.stringify(body ?? {})
		});
	} catch {
		throw new BandApiError(0, 'network');
	}

	const data = await response.json().catch(() => ({}));
	if (response.ok) return data as T;

	if (response.status === 401 && redirectOn401) {
		const { default: router } = await import('@router/index');
		const here = router.currentRoute.value;
		await router.push({ name: 'da-band-login', query: { redirect: here.fullPath } });
	}

	const { error, ...details } = data as { error?: string } & Record<string, unknown>;
	throw new BandApiError(response.status, error ?? 'error', details);
};
