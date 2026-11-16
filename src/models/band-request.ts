export interface BandRequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
	body?: unknown;
	/** `loadMe` handles its own 401. */
	redirectOn401?: boolean;
}
