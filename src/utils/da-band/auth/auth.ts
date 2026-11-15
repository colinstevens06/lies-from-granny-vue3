import { handleAuthCallback, logout, oauthLogin } from '@netlify/identity';

// The only client importer of @netlify/identity. It loads lazily: on a callback hash (main.ts) or a button press.

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

/** Finishes a sign-in after Google sends the browser back, and returns the path to show next. */
export const completeAuthCallback = async (): Promise<string> => {
	await handleAuthCallback().catch(() => undefined);

	try {
		const path = sessionStorage.getItem(REDIRECT_KEY);
		sessionStorage.removeItem(REDIRECT_KEY);
		if (path?.startsWith('/da-band')) return path;
	} catch {
		// fall through
	}

	return '/da-band';
};

export const signOut = () => logout();
