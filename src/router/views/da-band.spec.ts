import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { mountWithPrime } from '../../test-utils/mount';
import { useBandStore } from '@/stores/band';
import DaBand from './da-band.vue';

// Stub the child components but keep their slots, so the page's own text is what's under test.
const mountHome = () => mountWithPrime(DaBand, { shallow: true, global: { renderStubDefaultSlot: true } });

describe('da-band home page', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	// Code review #12: while loading (or after a failed load) the page showed "No practice on the calendar." and an
	// empty calendar under the loading line, as if the data had arrived empty.
	it('shows only the loading line while the data is still loading (code review #12)', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => new Promise(() => undefined))
		);
		const store = useBandStore();
		store.me = { member: 'colin', role: 'admin' } as never;

		const wrapper = mountHome();
		await flushPromises();

		expect(wrapper.text()).toContain('Loading…');
		expect(wrapper.text()).not.toContain('No practice on the calendar.');
		expect(wrapper.text()).not.toContain('Next gig');
	});

	it('shows only the error line after a failed load (code review #12)', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => Promise.reject(new Error('offline')))
		);
		const store = useBandStore();
		store.me = { member: 'colin', role: 'admin' } as never;

		const wrapper = mountHome();
		await vi.waitFor(() => expect(wrapper.text()).toContain("Couldn't load"));

		expect(wrapper.text()).not.toContain('No practice on the calendar.');
		expect(wrapper.text()).not.toContain('Practice history');
	});
});
