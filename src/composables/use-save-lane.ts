import { computed, ref } from 'vue';

// One write lane: a keyed queue with one request in flight, debounced flushes and retries. Written once and used for
// the availability lane and the form-answers lane, so both follow the same rules.

const RETRY_MS = [2000, 4000, 8000];
const RETRY_FOREVER_MS = 30000;

export interface SaveLaneOptions<V, R> {
	/** Quiet time after the last change before a flush. */
	delayMs: number;
	/** Sends one batch. Throw a `BandApiError` (or anything with a `status`) on failure. */
	send(entries: [key: string, value: V][]): Promise<R>;
	/** The batch saved. */
	onSaved(entries: [string, V][], result: R): void;
	/** The server refused the batch (a 4xx other than 401), so it was dropped. */
	onRejected(entries: [string, V][]): void;
}

export const useSaveLane = <V, R>({ delayMs, send, onSaved, onRejected }: SaveLaneOptions<V, R>) => {
	let queue = new Map<string, V>();
	let inflight: Map<string, V> | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let failures = 0;

	/** Bumped whenever the pending set changes, so the computeds below re-run. */
	const revision = ref(0);
	const failing = ref(false);
	const busy = computed(() => (revision.value, queue.size > 0 || inflight !== undefined));

	const touch = () => revision.value++;

	/** The value still waiting to save for a key (queued or in flight), newest first. */
	const pendingValue = (key: string): V | undefined => queue.get(key) ?? inflight?.get(key);
	const pendingKeys = () => new Set([...queue.keys(), ...(inflight?.keys() ?? [])]);

	const schedule = (ms: number) => {
		clearTimeout(timer);
		timer = setTimeout(flush, ms);
	};

	async function flush() {
		clearTimeout(timer);
		timer = undefined;
		if (inflight || queue.size === 0) return;

		const batch = queue;
		inflight = batch;
		queue = new Map();
		touch();
		const entries = [...batch];

		try {
			const result = await send(entries);
			inflight = undefined;
			failures = 0;
			failing.value = false;
			onSaved(entries, result);
		} catch (error) {
			// A BandApiError, matched by shape so this file doesn't pull band-api into the main bundle. Status 0 is no response.
			const status = (error as { status?: number }).status ?? 0;

			if (status === 0 || status >= 500) {
				// Back in the queue; anything queued meanwhile is newer and wins.
				for (const [key, value] of batch) if (!queue.has(key)) queue.set(key, value);
				inflight = undefined;
				failing.value = true;
				schedule(RETRY_MS[failures++] ?? RETRY_FOREVER_MS);
			} else {
				inflight = undefined;
				failing.value = false;
				// A 401 already sent the browser to login; anything else tells the user and reloads.
				if (status !== 401) onRejected(entries);
			}
		}

		touch();
		if (queue.size > 0 && !timer) schedule(delayMs);
	}

	/** Queues a change. `immediate` flushes now; any change while failing retries at once. */
	const enqueue = (key: string, value: V, { immediate = false } = {}) => {
		queue.set(key, value);
		touch();

		if (immediate || failing.value) void flush();
		else schedule(delayMs);
	};

	return { enqueue, pendingValue, pendingKeys, busy, failing, revision };
};
