import { handleAuthCallback } from '@netlify/identity';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { completeAuthCallback } from './auth';

vi.mock('@netlify/identity', () => ({
	handleAuthCallback: vi.fn(async () => null),
	logout: vi.fn(),
	oauthLogin: vi.fn(),
	refreshSession: vi.fn(async () => null)
}));

afterEach(() => {
	sessionStorage.clear();
});

describe('completeAuthCallback', () => {
	it('returns to the band page saved before sign-in', async () => {
		sessionStorage.setItem('da-band-redirect', '/da-band/form/3');
		expect(await completeAuthCallback()).toBe('/da-band/form/3');
	});

	it('ignores a saved path outside /da-band', async () => {
		sessionStorage.setItem('da-band-redirect', '//evil.example');
		expect(await completeAuthCallback()).toBe('/da-band');
	});

	// Code review on PR 21: a cancelled or failed Google sign-in was swallowed, and the member bounced to login
	// with no word on why.
	it('sends a failed sign-in back to login with a reason', async () => {
		sessionStorage.setItem('da-band-redirect', '/da-band/history');
		vi.mocked(handleAuthCallback).mockRejectedValueOnce(new Error('access_denied'));

		expect(await completeAuthCallback()).toBe('/da-band/login?reason=sign-in-failed&redirect=%2Fda-band%2Fhistory');
	});
});
