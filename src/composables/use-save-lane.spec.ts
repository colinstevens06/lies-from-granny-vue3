import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSaveLane } from './use-save-lane';

describe('useSaveLane', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	// Code review #8: while failing, every tap flushed at once and advanced the backoff, so 2s/4s/8s was used up in
	// three taps.
	it('keeps the retry schedule while failing, however much the member taps (code review #8)', async () => {
		const send = vi.fn(async () => {
			throw Object.assign(new Error('offline'), { status: 0 });
		});
		const lane = useSaveLane<string, void>({ delayMs: 400, send, onSaved: vi.fn(), onRejected: vi.fn() });

		lane.enqueue('a', '1');
		await vi.advanceTimersByTimeAsync(400);
		expect(send).toHaveBeenCalledTimes(1);

		for (const key of ['b', 'c', 'd', 'e', 'f']) {
			lane.enqueue(key, '1');
			await vi.advanceTimersByTimeAsync(10);
		}
		expect(send).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(2000);
		expect(send).toHaveBeenCalledTimes(2);
	});

	// Code review #9: onSaved ran inside the try, so a throw there looked like a network failure and the batch that had
	// already saved was queued and sent again.
	it('does not resend a saved batch when onSaved throws (code review #9)', async () => {
		const send = vi.fn(async () => undefined);
		const onSaved = vi.fn(() => {
			throw new Error('store bug');
		});
		const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const lane = useSaveLane<string, void>({ delayMs: 0, send, onSaved, onRejected: vi.fn() });

		lane.enqueue('a', '1');
		await vi.advanceTimersByTimeAsync(5);
		await vi.advanceTimersByTimeAsync(60_000);

		expect(logged).toHaveBeenCalled();
		logged.mockRestore();
		expect(send).toHaveBeenCalledTimes(1);
		expect(lane.busy.value).toBe(false);
	});
});
