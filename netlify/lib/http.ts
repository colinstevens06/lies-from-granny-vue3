import type { CurrentMember } from '../../src/models/band-member';
import { getCurrentMember, requireAdmin } from './current-member';
import { isFailure, type Failure } from './failure';

// Shared by every band function. Check order (contract 10): method → origin and content type on writes → path shape
// → identity → role → body shape → database lookups → validation that needs the looked-up row.

export const json = (status: number, body: unknown) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' }
	});

export const fail = (status: number, error: string, extra: Record<string, unknown> = {}) =>
	json(status, { error, ...extra });

/** A write must come from this site and carry JSON. Returns the refusal, or undefined when it passes. */
export const checkWrite = (req: Request) => {
	if (req.headers.get('origin') !== new URL(req.url).origin) return fail(403, 'bad-origin');
	if (!req.headers.get('content-type')?.includes('application/json')) return fail(403, 'bad-origin');
};

/** The parsed JSON body, or undefined when it isn't valid JSON. */
export const readBody = (req: Request) => req.json().catch(() => undefined) as Promise<unknown>;

/** The caller, or the 401 / 403 response. An unauthenticated request never reaches the database. */
export const authenticate = async (admin = false): Promise<CurrentMember | Response> => {
	const current = admin ? await requireAdmin() : await getCurrentMember();
	if (current === 'signed-out') return fail(401, 'signed-out');
	if (current === 'not-a-member') return fail(403, 'not-a-member');
	if (current === 'not-admin') return fail(403, 'not-admin');

	return current;
};

export const methodNotAllowed = () => fail(405, 'method-not-allowed');

/** A database result as a response: a `Failure` becomes its status and `{ error, ...details }`; anything else is a 200. */
export const respond = (
	result: unknown | Failure,
	success: (value: any) => Response // eslint-disable-line @typescript-eslint/no-explicit-any
) => (isFailure(result) ? fail(result.status, result.error, result.details) : success(result));

/** The numeric id in a path segment, or undefined when it isn't a positive integer. */
export const idFrom = (segment: string | undefined) =>
	/^[1-9]\d{0,9}$/.test(segment ?? '') ? Number(segment) : undefined;

/** Path segments after /api/band/<resource>. */
export const subPath = (req: Request) => new URL(req.url).pathname.replace(/\/+$/, '').split('/').slice(4);
