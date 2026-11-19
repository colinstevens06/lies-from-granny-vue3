import { onScopeDispose, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useBandData } from '@/composables/use-band-data';

export const SAVE_TOAST_GROUP = 'save';

/** Quiet time after the save queues empty before "Saved" shows. A tap in that window starts the wait over. */
export const SAVED_SETTLE_MS = 1250;
const SAVED_LIFE_MS = 2500;

/**
 * Confirms the /da-band autosave as a toast, rendered by `save-toast.vue`. A burst of taps gets one "Saved", shown once
 * both save queues have been empty for `SAVED_SETTLE_MS`. A save problem replaces it with a toast that stays until the
 * problem clears or the member closes it. One toast at a time: each new one clears the group first.
 */
export const useSaveToast = () => {
	const toast = useToast();
	const { saving, saveProblem, saveNotice } = useBandData();
	let timer: ReturnType<typeof setTimeout> | undefined;

	const cancelSaved = () => {
		clearTimeout(timer);
		timer = undefined;
	};

	const show = (message: Parameters<typeof toast.add>[0]) => {
		toast.removeGroup(SAVE_TOAST_GROUP);
		toast.add({ group: SAVE_TOAST_GROUP, ...message });
	};

	watch(saving, busy => {
		cancelSaved();
		if (busy || saveProblem.value) return;
		timer = setTimeout(() => {
			timer = undefined;
			show({ severity: 'success', summary: 'Saved', life: SAVED_LIFE_MS, closable: false });
		}, SAVED_SETTLE_MS);
	});

	watch(saveProblem, problem => {
		if (!problem) return toast.removeGroup(SAVE_TOAST_GROUP);
		cancelSaved();
		show({ severity: problem === 'retrying' ? 'warn' : 'error', summary: saveNotice.value });
	});

	onScopeDispose(cancelSaved);
};
