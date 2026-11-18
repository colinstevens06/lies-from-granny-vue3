import { computed } from 'vue';
import type { SaveProblem } from '@models/save-lane';
import { useAvailabilityStore } from '@/stores/availability';
import { useFormStore } from '@/stores/forms';
import { usePracticeStore } from '@/stores/practices';

const SAVE_NOTICE: Record<SaveProblem, string> = {
	retrying: 'Not saved yet. Retrying…',
	reloaded: "Couldn't save that. Your answers were reloaded."
};

/**
 * The band data as one thing for a page: availability, forms and practices loaded together, their load and save states
 * combined, and the one change that spans two stores (lock-in). No lifecycle hooks, so a component can use it too;
 * `useBandPage` adds the load on mount.
 */
export const useBandData = () => {
	const availabilityStore = useAvailabilityStore();
	const formStore = useFormStore();
	const practiceStore = usePracticeStore();
	const stores = [availabilityStore, formStore, practiceStore];

	/** Loads all three in parallel. Never rejects: each store records its own failure in its `loadState`. */
	const load = async () => {
		await Promise.all(stores.map(store => store.load()));
	};

	/** Any store failing shows the error; the page is ready only when all three are. */
	const loadState = computed(() => {
		if (stores.some(store => store.loadState === 'error')) return 'error';
		return stores.every(store => store.loadState === 'ready') ? 'ready' : 'loading';
	});

	/** True while either save queue is busy, so sign-off waits for answers of both kinds. */
	const saving = computed(() => availabilityStore.saving || formStore.saving);

	/** The worse of the two save queues' problems: a retry outranks a reload. */
	const saveProblem = computed((): SaveProblem | undefined => {
		const problems = [availabilityStore.saveProblem, formStore.saveProblem];
		return problems.includes('retrying') ? 'retrying' : problems.includes('reloaded') ? 'reloaded' : undefined;
	});
	const saveNotice = computed(() => saveProblem.value && SAVE_NOTICE[saveProblem.value]);

	/**
	 * Admin: books the days as practices and closes the form, then reloads both. Throws an `ApiError` (409
	 * `already-booked` names the days); the caller reloads with `load()` then.
	 */
	const lockIn = async (formId: number, days: string[]) => {
		await formStore.lockInForm(formId, days);
		await Promise.all([formStore.load(), practiceStore.load()]);
	};

	return { load, loadState, saving, saveProblem, saveNotice, lockIn };
};
