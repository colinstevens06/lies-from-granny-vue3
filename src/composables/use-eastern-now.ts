import { computed, getCurrentScope, onScopeDispose, ref } from 'vue';
import { easternNow } from '@utils/dates';

const REFRESH_MS = 30_000;

/**
 * The current Eastern wall-clock time ('YYYY-MM-DDTHH:MM') and its day, kept fresh: a tab left open past midnight moves
 * on to the new day within half a minute, or at once when the tab becomes visible again.
 */
export const useEasternNow = () => {
	const now = ref(easternNow());
	const refresh = () => {
		now.value = easternNow();
	};

	const timer = setInterval(refresh, REFRESH_MS);
	document.addEventListener('visibilitychange', refresh);
	if (getCurrentScope()) {
		onScopeDispose(() => {
			clearInterval(timer);
			document.removeEventListener('visibilitychange', refresh);
		});
	}

	return { now, today: computed(() => now.value.slice(0, 10)) };
};
