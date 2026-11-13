import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeAvailability, makeForm } from '../test-utils/factories';
import { useBandStore } from './band';

// The store talks to the server through band-api's fetch, so the tests stub fetch. (Mocking the band-api module
// instead doesn't work: the store imports it dynamically, and vitest 0.34 hands concurrent dynamic imports the real
// module.) Real timers throughout, for the same reason.
type Handler = (
	path: string,
	method: string
) => { status?: number; body: unknown } | Promise<{ status?: number; body: unknown }>;

const serve = (handler: Handler) =>
	vi.stubGlobal(
		'fetch',
		vi.fn(async (url: string, init?: { method?: string }) => {
			const { status = 200, body } = await handler(url.replace('/api/band/', ''), init?.method ?? 'GET');
			return { ok: status < 400, status, json: async () => body };
		})
	);

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const answer = (day: string, value: 'yes' | 'no' | 'maybe') => ({ date: day, answer: value });

const signedInStore = () => {
	const store = useBandStore();
	store.me = { member: 'colin' } as never;
	store.availability = [makeAvailability('colin', {})];
	return store;
};

describe('band store', () => {
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
					: { body: { availability: makeAvailability('colin', { '2026-12-02': 'no' }) } };
			}
			if (path === 'availability') return { body: { members: [makeAvailability('colin', {})] } };
			return { body: path === 'forms' ? { forms: [] } : { practices: [] } };
		});

		store.setMyAnswers([answer('2026-12-01', 'yes')], { immediate: true });
		store.setMyAnswers([answer('2026-12-02', 'no')]);
		await vi.waitFor(() => expect(store.myDays['2026-12-01']).toBeUndefined());

		expect(store.myDays['2026-12-01']).toBeUndefined();
		expect(store.myDays['2026-12-02']?.answer).toBe('no');

		await wait(450); // let the queued tap save, so it can't leak into the next test
	});

	// Code review #5: a save finishing while a load was in flight froze every form's copy, not just the saved one, so a
	// form the admin had just closed still looked open.
	it("takes the server's copy of other forms when a save finishes during a load (code review #5)", async () => {
		const store = signedInStore();
		store.forms = [makeForm({ id: 1 }), makeForm({ id: 2 })];

		let releaseForms!: () => void;
		const formsGate = new Promise<void>(resolve => (releaseForms = resolve));
		serve(async path => {
			if (path === 'forms/1/answers') return { body: { form: makeForm({ id: 1 }) } };
			if (path === 'availability') return { body: { members: [makeAvailability('colin', {})] } };
			if (path === 'forms') {
				await formsGate;
				return { body: { forms: [makeForm({ id: 1 }), makeForm({ id: 2, closedAt: '2026-11-12T12:00:00Z' })] } };
			}
			return { body: { practices: [] } };
		});

		const loading = store.load();
		store.setMyFormAnswer(1, { wantsNew: false });
		await wait(700); // the form lane's 600 ms debounce, then the save lands
		releaseForms();
		await loading;

		expect(store.loadState).toBe('ready');
		expect(store.forms.find(form => form.id === 2)?.closedAt).toBe('2026-11-12T12:00:00Z');
	});
});
