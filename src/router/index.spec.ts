import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMemberStore } from '@/stores/member';
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
		vi.spyOn(useMemberStore(), 'loadMe').mockRejectedValue(new Error('offline'));

		await router.push('/da-band');

		expect(router.currentRoute.value.name).toBe('da-band-login');
		expect(router.currentRoute.value.query).toEqual({ reason: 'error', redirect: '/da-band' });
	});

	// Code review on PR 21: after a 401 sent the browser to login, the nav still showed the member and the guard
	// let the next band page through on the cached answer.
	it('forgets the cached member on the way to the login page', async () => {
		const memberStore = useMemberStore();
		memberStore.me = { member: 'colin', role: 'admin' };
		vi.spyOn(memberStore, 'loadMe').mockResolvedValue('signed-out');

		await router.push({ name: 'da-band-login' });

		expect(memberStore.me).toBeUndefined();
	});

	// Google returns to the page that started sign-in, which is the login page, so a signed-in member lands there.
	describe('login page when already signed in', () => {
		it('sends a signed-in member on to the page they were headed for', async () => {
			vi.spyOn(useMemberStore(), 'loadMe').mockResolvedValue('ok');

			await router.push({ name: 'da-band-login', query: { redirect: '/da-band/forms' } });

			expect(router.currentRoute.value.fullPath).toBe('/da-band/forms');
		});

		it('sends a signed-in member to the band home when there is no redirect', async () => {
			vi.spyOn(useMemberStore(), 'loadMe').mockResolvedValue('ok');

			await router.push({ name: 'da-band-login' });

			expect(router.currentRoute.value.fullPath).toBe('/da-band');
		});

		it('keeps a signed-out visitor on the login page', async () => {
			vi.spyOn(useMemberStore(), 'loadMe').mockResolvedValue('signed-out');

			await router.push({ name: 'da-band-login' });

			expect(router.currentRoute.value.name).toBe('da-band-login');
		});

		it('keeps the login page when the identity check fails', async () => {
			vi.spyOn(useMemberStore(), 'loadMe').mockRejectedValue(new Error('offline'));

			await router.push({ name: 'da-band-login' });

			expect(router.currentRoute.value.name).toBe('da-band-login');
		});

		it('keeps the login page when it has a reason to show, without asking the server', async () => {
			const loadMe = vi.spyOn(useMemberStore(), 'loadMe').mockResolvedValue('ok');

			await router.push({ name: 'da-band-login', query: { reason: 'not-a-member' } });

			expect(router.currentRoute.value.name).toBe('da-band-login');
			expect(loadMe).not.toHaveBeenCalled();
		});
	});
});
