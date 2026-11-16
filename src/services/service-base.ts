import { ApiError } from '@models/api-error';
import type { HttpMethod, JsonBody, RequestOptions } from '@models/request-options';

/**
 * The only `fetch` for the site's own APIs, not tied to any one domain. A service extends it, passes its base path
 * and calls the protected verb helpers, so no service method names a verb as a string or touches `fetch`. JSON in and
 * out; a failure throws an `ApiError`.
 *
 * Three hooks for what differs per API: `beforeRequest` (work to finish before any request, like renewing a session),
 * `requestHeaders` (extra headers on every request) and `onUnauthorized` (what a 401 does). All default to nothing.
 */
export class ServiceBase {
	constructor(private readonly basePath: string) {}

	protected get<T>(path: string, options?: RequestOptions) {
		return this.request<T>('GET', path, undefined, options);
	}

	protected post<T>(path: string, body: JsonBody = {}, options?: RequestOptions) {
		return this.request<T>('POST', path, body, options);
	}

	protected put<T>(path: string, body: JsonBody, options?: RequestOptions) {
		return this.request<T>('PUT', path, body, options);
	}

	protected patch<T>(path: string, body: JsonBody, options?: RequestOptions) {
		return this.request<T>('PATCH', path, body, options);
	}

	protected delete<T = void>(path: string, options?: RequestOptions) {
		return this.request<T>('DELETE', path, undefined, options);
	}

	/** Runs before every request is sent. */
	protected async beforeRequest(): Promise<void> {}

	/** Extra headers sent with every request. */
	protected async requestHeaders(): Promise<Record<string, string>> {
		return {};
	}

	/** Runs on a 401 before the `ApiError` is thrown, unless the caller passed `handleUnauthorized: false`. */
	protected async onUnauthorized(): Promise<void> {}

	private async request<T>(
		method: HttpMethod,
		path: string,
		body: JsonBody | undefined,
		{ handleUnauthorized = true }: RequestOptions = {}
	): Promise<T> {
		await this.beforeRequest();

		let response: Response;
		try {
			response = await fetch(`${this.basePath}/${path}`, {
				method,
				credentials: 'same-origin',
				headers: {
					...(body === undefined ? {} : { 'content-type': 'application/json' }),
					...(await this.requestHeaders())
				},
				body: body === undefined ? undefined : JSON.stringify(body)
			});
		} catch {
			throw new ApiError(0, 'network');
		}

		const data = await response.json().catch(() => ({}));
		if (response.ok) return data as T;

		if (response.status === 401 && handleUnauthorized) await this.onUnauthorized();

		const { error, ...details } = data as { error?: string } & Record<string, unknown>;
		throw new ApiError(response.status, error ?? 'error', details);
	}
}
