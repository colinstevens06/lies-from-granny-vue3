// Vitest setup: jsdom has no matchMedia, which PrimeVue's overlay components probe.
if (!window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			addEventListener: () => undefined,
			removeEventListener: () => undefined,
			addListener: () => undefined,
			removeListener: () => undefined,
			dispatchEvent: () => false,
			onchange: null
		} as MediaQueryList);
}
