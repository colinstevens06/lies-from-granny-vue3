import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeAvailability, makeForm } from '../test-utils/factories';
import { gate, serve, wait } from '../test-utils/serve';
import { useAvailabilityStore } from './availability';
import { useFormStore } from './forms';
import { useMemberStore } from './member';

const answer = (day: string, value: 'yes' | 'no' | 'maybe') => ({ date: day, answer: value });

const signedInStore = (days: Parameters<typeof makeAvailability>[1] = {}) => {
	useMemberStore().me = { member: 'colin' } as never;
	const store = useAvailabilityStore();
	store.availability = [makeAvailability('colin', days)];
	return store;
};

describe('availability store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	// Code review #1 (planning/2026-11-da-band-code-review.md): the member kept tapping, so the lane was still busy when
	// the rejection triggered load(), and load() kept the local row, refused answer and all.
	it('drops a refused availability answer from the screen even while later taps are queued (code review #1)', async () => {
		const store = signedInStore();

		let patches = 0;
		serve(path => {
			if (path.startsWith('availability/')) {
				return patches++ === 0
					? { status: 400, body: { error: 'date-out-of-range' } }
					: { body: makeAvailability('colin', { '2026-12-02': 'no' }) };
			}
			return { body: [makeAvailability('colin', {})] };
		});

		store.setMyAnswers([answer('2026-12-01', 'yes')], { immediate: true });
		store.setMyAnswers([answer('2026-12-02', 'no')]);
		await vi.waitFor(() => expect(store.myDays['2026-12-01']).toBeUndefined());

		expect(store.myDays['2026-12-01']).toBeUndefined();
		expect(store.myDays['2026-12-02']?.answer).toBe('no');

		await wait(450); // let the queued tap save, so it can't leak into the next test
	});

	it("reports a refused save as 'reloaded' until the next save lands", async () => {
		const store = signedInStore();
		let patches = 0;
		serve(path => {
			if (!path.startsWith('availability/')) return { body: [makeAvailability('colin', {})] };
			return patches++ === 0
				? { status: 400, body: { error: 'date-out-of-range' } }
				: { body: makeAvailability('colin', { '2026-12-02': 'no' }) };
		});

		expect(store.saveProblem).toBeUndefined();
		store.setMyAnswers([answer('2026-12-01', 'yes')], { immediate: true });
		await vi.waitFor(() => expect(store.saveProblem).toBe('reloaded'));
		await vi.waitFor(() => expect(store.loadState).toBe('ready'));

		store.setMyAnswers([answer('2026-12-02', 'no')], { immediate: true });
		await vi.waitFor(() => expect(store.saveProblem).toBeUndefined());
	});

	// Phase 2 of planning/2026-11-da-band-layering.md: one save counter for both queues meant a form save during an
	// availability load kept my stale local row instead of the server's.
	it("takes the server's copy of my row when only a form save finished during the load", async () => {
		const store = signedInStore({ '2026-12-01': 'yes' });
		const forms = useFormStore();
		forms.forms = [makeForm({ id: 1 })];

		const availabilityGate = gate();
		serve(async path => {
			if (path === 'forms/1/members/colin/answers') return { body: makeForm({ id: 1 }) };
			await availabilityGate.opened;
			return { body: [makeAvailability('colin', { '2026-12-01': 'no' })] };
		});

		const loading = store.load();
		forms.setMyFormAnswer(1, { wantsNew: false });
		await wait(700); // the form lane's 600 ms debounce, then the save lands
		availabilityGate.release();
		await loading;

		expect(store.myDays['2026-12-01']?.answer).toBe('no');
	});
});
