// Kept apart from auth.ts so the login page can use it without loading the Identity library.

const HOME = '/da-band';
/** A stand-in origin for parsing: anything that resolves elsewhere (`//evil.example`, `https://…`) is refused. */
const BASE = 'https://band.invalid';

/**
 * Where to send the browser after sign-in: the given path when it's a /da-band page on this site, else /da-band.
 * Every `redirect` read from a query string or storage goes through this.
 */
export const bandRedirect = (value: unknown): string => {
	if (typeof value !== 'string' || !value.startsWith('/')) return HOME;

	let url: URL;
	try {
		url = new URL(value, BASE);
	} catch {
		return HOME;
	}

	const isBandPage = url.pathname === HOME || url.pathname.startsWith(`${HOME}/`);
	return url.origin === BASE && isBandPage ? `${url.pathname}${url.search}${url.hash}` : HOME;
};
