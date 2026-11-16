import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import type { VueWrapper } from '@vue/test-utils';
import { mountWithPrime } from '../test-utils/mount';
import type { SaveProblem } from '@models/save-lane';
import { useBandStore } from '@/stores/band';
import { useBandPage } from './use-band-page';

/** Mounts a bare component running the composable, so its `onMounted` fires as it does in a view. */
let mounted: VueWrapper | undefined;

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

	it('loads the band data once when the page opens', () => {
		const load = vi.spyOn(useBandStore(), 'load').mockResolvedValue();
		mountPage();
		expect(load).toHaveBeenCalledTimes(1);
	});

	it.each<[SaveProblem | undefined, string | undefined]>([
		['retrying', 'Not saved yet. Retrying…'],
		['reloaded', "Couldn't save that. Your answers were reloaded."],
		[undefined, undefined]
	])('words the save problem %s for the member, and follows it as it changes', async (problem, notice) => {
		const store = useBandStore();
		vi.spyOn(store, 'load').mockResolvedValue();
		// `saveProblem` is a getter over the save queues (the store spec drives a real refusal); a ref stands in for it here.
		const current = ref<SaveProblem>();
		Object.defineProperty(store, 'saveProblem', { get: () => current.value });

		const page = mountPage();
		expect(page.saveNotice.value).toBeUndefined();

		current.value = problem;
		await nextTick();
		expect(page.saveNotice.value).toBe(notice);
	});
});
