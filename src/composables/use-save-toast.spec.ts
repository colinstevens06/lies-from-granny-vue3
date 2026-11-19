import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import type { VueWrapper } from '@vue/test-utils';
import ToastService from 'primevue/toastservice';
import { useToast } from 'primevue/usetoast';
import { mountWithPrime } from '../test-utils/mount';
import type { SaveProblem } from '@models/save-lane';
import { useAvailabilityStore } from '@/stores/availability';
import { useFormStore } from '@/stores/forms';
import { SAVED_SETTLE_MS, SAVE_TOAST_GROUP, useSaveToast } from './use-save-toast';

let mounted: VueWrapper | undefined;

// `saving` and `saveProblem` are getters over the stores' save queues (the store specs drive real saves); refs stand in.
const saving = ref(false);
const problem = ref<SaveProblem>();

/** Mounts a bare component running the composable, and spies on the toast service it talks to. */
const mountToast = () => {
	Object.defineProperty(useAvailabilityStore(), 'saving', { get: () => saving.value });
	Object.defineProperty(useAvailabilityStore(), 'saveProblem', { get: () => problem.value });

	let toast!: ReturnType<typeof useToast>;
	mounted = mountWithPrime(
		defineComponent({
			setup() {
				toast = useToast();
				useSaveToast();
				return () => h('div');
			}
		}),
		{ global: { plugins: [ToastService] } }
	);
	return { add: vi.spyOn(toast, 'add'), removeGroup: vi.spyOn(toast, 'removeGroup') };
};

/** One tap's trip through the queue: busy, then empty again. */
const saveOnce = async () => {
	saving.value = true;
	await nextTick();
	saving.value = false;
	await nextTick();
};

describe('useSaveToast', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.useFakeTimers();
		saving.value = false;
		problem.value = undefined;
		// Keeps the form store's real lane out of it.
		Object.defineProperty(useFormStore(), 'saving', { get: () => false });
		Object.defineProperty(useFormStore(), 'saveProblem', { get: () => undefined });
	});
	afterEach(() => {
		mounted?.unmount();
		mounted = undefined;
		vi.useRealTimers();
	});

	it('shows one "Saved" for a burst of taps, once the queues have been quiet for the settle time', async () => {
		const { add } = mountToast();

		for (let tap = 0; tap < 5; tap++) {
			await saveOnce();
			vi.advanceTimersByTime(SAVED_SETTLE_MS - 100);
		}
		expect(add).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(add).toHaveBeenCalledOnce();
		expect(add).toHaveBeenCalledWith(
			expect.objectContaining({ group: SAVE_TOAST_GROUP, severity: 'success', summary: 'Saved' })
		);
	});

	it('shows a retry as a warning that stays, then "Saved" once the retry lands', async () => {
		const { add, removeGroup } = mountToast();

		saving.value = true;
		problem.value = 'retrying';
		await nextTick();
		expect(add).toHaveBeenLastCalledWith(
			expect.objectContaining({ severity: 'warn', summary: 'Not saved yet. Retrying…' })
		);
		// No `life`: it stays up until the retry lands.
		expect(add.mock.lastCall?.[0]).not.toHaveProperty('life');

		saving.value = false;
		problem.value = undefined;
		await nextTick();
		expect(removeGroup).toHaveBeenLastCalledWith(SAVE_TOAST_GROUP);

		vi.advanceTimersByTime(SAVED_SETTLE_MS);
		expect(add).toHaveBeenLastCalledWith(expect.objectContaining({ severity: 'success', summary: 'Saved' }));
	});

	it('shows a refused save as an error and never says "Saved" for it', async () => {
		const { add } = mountToast();

		saving.value = true;
		await nextTick();
		saving.value = false;
		problem.value = 'reloaded';
		await nextTick();
		vi.advanceTimersByTime(SAVED_SETTLE_MS * 2);

		expect(add).toHaveBeenCalledOnce();
		expect(add).toHaveBeenCalledWith(
			expect.objectContaining({ severity: 'error', summary: "Couldn't save that. Your answers were reloaded." })
		);
	});

	it('drops a pending "Saved" when the page closes', async () => {
		const { add } = mountToast();

		await saveOnce();
		mounted!.unmount();
		mounted = undefined;
		vi.advanceTimersByTime(SAVED_SETTLE_MS);

		expect(add).not.toHaveBeenCalled();
	});
});
