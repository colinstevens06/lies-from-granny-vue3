const CALLBACK_HASH = /(access_token|confirmation_token|invite_token|recovery_token|email_change_token|error)=/;

/** True when the URL hash carries an Identity callback. Kept apart from auth.ts so checking it doesn't load the library. */
export const hasAuthCallbackHash = (hash = window.location.hash) => CALLBACK_HASH.test(hash);
