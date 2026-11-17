/**
 * Asks the browser to confirm leaving while `busy()` is true, so a save still in its queue isn't lost to a closed tab.
 * Each store with a save queue registers one for the app's lifetime; stores are never torn down, so nothing removes it.
 */
export const warnBeforeUnloadWhile = (busy: () => boolean) => {
	if (typeof window === 'undefined') return;

	window.addEventListener('beforeunload', event => {
		if (!busy()) return;
		event.preventDefault();
		event.returnValue = '';
	});
};
