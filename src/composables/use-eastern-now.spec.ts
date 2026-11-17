import { effectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEasternNow } from './use-eastern-now';

describe('useEasternNow', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	// Code review #6 (planning/2026-11-da-band-code-review.md): "today" was read once at setup, so a tab left open
	// overnight kept treating yesterday as today.
	it('moves to the next Eastern day after midnight without a reload (code review #6)', async () => {
		vi.setSystemTime(new Date('2026-11-13T04:59:30Z')); // 11:59:30 PM on Nov 12 in Eastern
		const scope = effectScope();
		const { today } = scope.run(() => useEasternNow())!;
		expect(today.value).toBe('2026-11-12');

		await vi.advanceTimersByTimeAsync(90_000);
		expect(today.value).toBe('2026-11-13');
		scope.stop();
	});

	it('refreshes when the tab becomes visible again', () => {
		vi.setSystemTime(new Date('2026-11-13T04:59:30Z'));
		const scope = effectScope();
		const { today } = scope.run(() => useEasternNow())!;

		vi.setSystemTime(new Date('2026-11-13T12:00:00Z'));
		document.dispatchEvent(new Event('visibilitychange'));
		expect(today.value).toBe('2026-11-13');
		scope.stop();
	});
});
