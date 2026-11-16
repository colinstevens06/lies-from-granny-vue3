import { computed, onMounted } from 'vue';
import type { SaveProblem } from '@models/save-lane';
import { useBandStore } from '@/stores/band';

const SAVE_NOTICE: Record<SaveProblem, string> = {
	retrying: 'Not saved yet. Retrying…',
	reloaded: "Couldn't save that. Your answers were reloaded."
};

/**
 * The page shell's half of every /da-band view: loads the band data when the page opens, so any page works when visited
 * directly, and words the store's save state for the member.
 */
export const useBandPage = () => {
	const band = useBandStore();
	onMounted(() => band.load());

	const loadState = computed(() => band.loadState);
	const saveNotice = computed(() => (band.saveProblem ? SAVE_NOTICE[band.saveProblem] : undefined));

	return { loadState, saveNotice };
};
