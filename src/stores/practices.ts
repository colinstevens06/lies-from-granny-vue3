import { ref } from 'vue';
import { defineStore } from 'pinia';
import { bandService } from '@/services/band-service';
import type { LoadState } from '@models/load-state';
import type { Practice, PracticeInput } from '@models/practice';

/** Every practice, past and upcoming. Admin edits go straight through the service; there's no save queue. */
export const usePracticeStore = defineStore('practices', () => {
	const practices = ref<Practice[]>([]);
	const loadState = ref<LoadState>('idle');

	const load = async () => {
		if (loadState.value !== 'ready') loadState.value = 'loading';
		try {
			practices.value = await bandService.getPractices();
			loadState.value = 'ready';
		} catch {
			// A 401 already went to login. Anything else keeps what's on screen and shows the error state.
			if (loadState.value !== 'ready') loadState.value = 'error';
		}
	};

	/**
	 * Admin: creates a practice (no `id`) or replaces one (whole record), and updates the list. Throws an `ApiError`
	 * (409 `date-taken`, 400 with the error code).
	 */
	const savePractice = async (input: PracticeInput, id?: number) => {
		const practice = await (id === undefined ? bandService.postPractice(input) : bandService.putPractice(id, input));
		practices.value =
			id === undefined
				? [...practices.value, practice]
				: practices.value.map(p => (p.id === practice.id ? practice : p));
	};

	return { practices, loadState, load, savePractice };
});
