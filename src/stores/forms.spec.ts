import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeForm } from '../test-utils/factories';
import { gate, serve, wait } from '../test-utils/serve';
import { useFormStore } from './forms';
import { useMemberStore } from './member';

const signedInStore = () => {
	useMemberStore().me = { member: 'colin' } as never;
	return useFormStore();
};

describe('form store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("reloads only the forms and reports 'reloaded' when a form answer is refused", async () => {
		const store = signedInStore();
		store.forms = [makeForm({ id: 1 })];
		const calls: string[] = [];
		serve((path, method) => {
			calls.push(`${method} ${path}`);
			return path === 'forms/1/members/colin/answers'
				? { status: 400, body: { error: 'bad-song' } }
				: { body: [makeForm({ id: 1 })] };
		});

		store.setMyFormAnswer(1, { wantsNew: true, suggestion: '' });
		await vi.waitFor(() => expect(store.saveProblem).toBe('reloaded'));
		await vi.waitFor(() => expect(calls).toContain('GET forms'));

		expect(calls).toEqual(['PUT forms/1/members/colin/answers', 'GET forms']);
	});

	it('signs me off by patching my own row on the form, and shows the form the server returns', async () => {
		const store = signedInStore();
		store.forms = [makeForm({ id: 1 })];
		const signedOff = makeForm({ id: 1, closedAt: '2026-11-15T12:00:00Z' });
		const calls: string[] = [];
		serve((path, method) => {
			calls.push(`${method} ${path}`);
			return { body: signedOff };
		});

		await store.signOffForm(1);

		expect(calls).toEqual(['PATCH forms/1/members/colin']);
		expect(store.forms[0]).toEqual(signedOff);
	});

	// Code review #5: a save finishing while a load was in flight froze every form's copy, not just the saved one, so a
	// form the admin had just closed still looked open.
	it("takes the server's copy of other forms when a save finishes during a load (code review #5)", async () => {
		const store = signedInStore();
		store.forms = [makeForm({ id: 1 }), makeForm({ id: 2 })];

		const formsGate = gate();
		serve(async path => {
			if (path === 'forms/1/members/colin/answers') return { body: makeForm({ id: 1 }) };
			await formsGate.opened;
			return { body: [makeForm({ id: 1 }), makeForm({ id: 2, closedAt: '2026-11-12T12:00:00Z' })] };
		});

		const loading = store.load();
		store.setMyFormAnswer(1, { wantsNew: false });
		await wait(700); // the form lane's 600 ms debounce, then the save lands
		formsGate.release();
		await loading;

		expect(store.loadState).toBe('ready');
		expect(store.forms.find(form => form.id === 2)?.closedAt).toBe('2026-11-12T12:00:00Z');
	});
});
