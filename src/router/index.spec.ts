import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBandStore } from '@/stores/band';
import router from './index';

describe('band route guard', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		// jsdom has no scrollIntoView, which the router's beforeResolve calls.
		Element.prototype.scrollIntoView = vi.fn();
	});

	// Code review #4 (planning/2026-11-da-band-code-review.md): a network or 5xx error from loadMe rejected the
	// navigation, which left the first load blank and made a click on a band link do nothing.
	it('sends a failed identity check to the login page with an error reason (code review #4)', async () => {
		vi.spyOn(useBandStore(), 'loadMe').mockRejectedValue(new Error('offline'));

		await router.push('/da-band');

		expect(router.currentRoute.value.name).toBe('da-band-login');
		expect(router.currentRoute.value.query).toEqual({ reason: 'error', redirect: '/da-band' });
	});
});
