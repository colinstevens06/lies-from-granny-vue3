import { handleAuthCallback, logout, oauthLogin, refreshSession } from '@netlify/identity';
import { bandRedirect } from './band-redirect';

// The only client importer of @netlify/identity. It loads lazily: on a callback hash (main.ts), a button press, or
// the first band API call.

const REDIRECT_KEY = 'da-band-redirect';
/** Sends the browser to Google. `redirect` is where to land after the callback. */
export const signInWithGoogle = (redirect: string) => {
	try {
		sessionStorage.setItem(REDIRECT_KEY, redirect);
	} catch {
		// Private windows can refuse storage; the user lands on /da-band instead.
	}
	oauthLogin('google');
};

/** The path saved before leaving for Google, read once. */
const takeRedirect = () => {
	try {
		const path = sessionStorage.getItem(REDIRECT_KEY);
		sessionStorage.removeItem(REDIRECT_KEY);
		return bandRedirect(path);
	} catch {
		return bandRedirect(undefined);
	}
};

/**
 * Finishes a sign-in after Google sends the browser back, and returns the path to show next. A failed or cancelled
 * sign-in goes back to the login page with a reason, so the member sees why instead of a silent bounce.
 */
export const completeAuthCallback = async (): Promise<string> => {
	const redirect = takeRedirect();

	try {
		await handleAuthCallback();
		return redirect;
	} catch {
		const query = new URLSearchParams({ reason: 'sign-in-failed', redirect });
		return `/da-band/login?${query}`;
	}
};

/**
 * Renews the Identity access token when it's within a minute of expiring, before a band API call. The token lasts an
 * hour and the server can't renew it and use it in the same request (Netlify's `cookies.get` reads only the request
 * headers), so the browser does it first. Never throws: a session that can't be renewed shows up as the call's 401.
 */
export const refreshIfNeeded = async () => {
	await refreshSession().catch(() => undefined);
};

export const signOut = () => logout();
