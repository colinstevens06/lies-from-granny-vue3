import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, type VueWrapper } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { makeForm } from '../../../test-utils/factories';
import { mountWithPrime } from '../../../test-utils/mount';
import { useAvailabilityStore } from '@/stores/availability';
import { useFormStore } from '@/stores/forms';
import { useMemberStore } from '@/stores/member';
import { usePracticeStore } from '@/stores/practices';
import ShowNightsSheet from '@components/da-band/forms/show-nights-sheet.vue';
import FormPage from './form.vue';

let wrapper: VueWrapper | undefined;

/** The form page at /da-band/form/1 with every store already loaded, so nothing reaches fetch. */
const openFormPage = async () => {
	const router = createRouter({
		history: createMemoryHistory(),
		routes: [
			{ path: '/da-band', component: { template: '<div />' } },
			{ path: '/da-band/form/:id(\\d+)', component: FormPage }
		]
	});
	await router.push('/da-band/form/1');

	// Stub the children but keep the page's own controls, so the Sign off button is the real one.
	wrapper = mountWithPrime(FormPage, {
		shallow: true,
		global: { plugins: [router], renderStubDefaultSlot: true, stubs: { Button: false } }
	});
	await flushPromises();
	return { wrapper, router };
};

describe('da-band form page', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		useMemberStore().me = { member: 'colin', role: 'member' } as never;
		for (const store of [useAvailabilityStore(), useFormStore(), usePracticeStore()]) {
			vi.spyOn(store, 'load').mockResolvedValue();
			store.loadState = 'ready';
		}
		// A range that's already over, so the sign-off rule finds nothing missing.
		useFormStore().forms = [makeForm({ id: 1, availability: { startDay: '2020-01-01', endDay: '2020-01-31' } })];
	});
	afterEach(() => {
		wrapper?.unmount();
		wrapper = undefined;
	});

	// Phase 2 of planning/2026-11-da-band-layering.md: `saving` became a ref from `useBandData`, and the script's
	// `if (… || saving)` was always true, so Sign off silently did nothing.
	it('signs me off and goes back to Da Band when I tap Sign off', async () => {
		const signOff = vi.spyOn(useFormStore(), 'signOffForm').mockResolvedValue();
		const { wrapper, router } = await openFormPage();

		await wrapper.get('button[aria-label="Sign off"]').trigger('click');
		// A form with availability confirms its show nights first.
		wrapper.findComponent(ShowNightsSheet).vm.$emit('confirm');
		await flushPromises();

		expect(signOff).toHaveBeenCalledWith(1);
		expect(router.currentRoute.value.path).toBe('/da-band');
	});
});
