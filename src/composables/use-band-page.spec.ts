import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import type { VueWrapper } from '@vue/test-utils';
import { mountWithPrime } from '../test-utils/mount';
import type { SaveProblem } from '@models/save-lane';
import { useAvailabilityStore } from '@/stores/availability';
import { useFormStore } from '@/stores/forms';
import { usePracticeStore } from '@/stores/practices';
import { useBandPage } from './use-band-page';

let mounted: VueWrapper | undefined;

/** Stubs the three loads, so a mounted page never reaches fetch. */
const stubLoads = () =>
	[useAvailabilityStore(), useFormStore(), usePracticeStore()].map(store =>
		vi.spyOn(store, 'load').mockResolvedValue()
	);

/** Mounts a bare component running the composable, so its `onMounted` fires as it does in a view. */
const mountPage = () => {
	let page!: ReturnType<typeof useBandPage>;
	mounted = mountWithPrime(
		defineComponent({
			setup() {
				page = useBandPage();
				return () => h('div');
			}
		})
	);
	return page;
};

describe('useBandPage', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});
	afterEach(() => {
		mounted?.unmount();
		mounted = undefined;
	});

	it('loads availability, forms and practices once each when the page opens', () => {
		const loads = stubLoads();
		mountPage();
		for (const load of loads) expect(load).toHaveBeenCalledTimes(1);
	});

	it.each<[SaveProblem | undefined, string | undefined]>([
		['retrying', 'Not saved yet. Retrying…'],
		['reloaded', "Couldn't save that. Your answers were reloaded."],
		[undefined, undefined]
	])('words the save problem %s for the member, and follows it as it changes', async (problem, notice) => {
		stubLoads();
		// `saveProblem` is a getter over a store's save queue (the availability spec drives a real refusal); a ref stands
		// in for the form store's here.
		const current = ref<SaveProblem>();
		Object.defineProperty(useFormStore(), 'saveProblem', { get: () => current.value });

		const page = mountPage();
		expect(page.saveNotice.value).toBeUndefined();

		current.value = problem;
		await nextTick();
		expect(page.saveNotice.value).toBe(notice);
	});

	it('says "retrying" when one queue is retrying and the other was refused', () => {
		stubLoads();
		Object.defineProperty(useAvailabilityStore(), 'saveProblem', { get: () => 'reloaded' });
		Object.defineProperty(useFormStore(), 'saveProblem', { get: () => 'retrying' });

		expect(mountPage().saveNotice.value).toBe('Not saved yet. Retrying…');
	});
});
