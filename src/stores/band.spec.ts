import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeAvailability } from '../test-utils/factories';
import { useBandStore } from './band';

const api = vi.hoisted(() => ({ bandApi: vi.fn() }));
vi.mock('@utils/band-api', () => ({ bandApi: api.bandApi, BandApiError: class extends Error {} }));

const answer = (day: string, value: 'yes' | 'no' | 'maybe') => ({ date: day, answer: value });

describe('band store', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		setActivePinia(createPinia());
		api.bandApi.mockReset();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	// Code review #1 (planning/2026-11-da-band-code-review.md): the member kept tapping, so the lane was still busy when
	// the rejection triggered load(), and load() kept the local row, refused answer and all.
	it('drops a refused availability answer from the screen even while later taps are queued (code review #1)', async () => {
		const store = useBandStore();
		store.me = { member: 'colin' } as never;
		store.availability = [makeAvailability('colin', {})];

		let patches = 0;
		api.bandApi.mockImplementation(async (path: string) => {
			if (path.startsWith('availability/')) {
				if (patches++ === 0) throw Object.assign(new Error('date-out-of-range'), { status: 400 });
				return { availability: makeAvailability('colin', { '2026-12-02': 'no' }) };
			}
			if (path === 'availability') return { members: [makeAvailability('colin', {})] };
			return path === 'forms' ? { forms: [] } : { practices: [] };
		});

		store.setMyAnswers([answer('2026-12-01', 'yes')], { immediate: true });
		store.setMyAnswers([answer('2026-12-02', 'no')]);
		await vi.advanceTimersByTimeAsync(10);

		expect(store.myDays['2026-12-01']).toBeUndefined();
		expect(store.myDays['2026-12-02']?.answer).toBe('no');
	});
});
