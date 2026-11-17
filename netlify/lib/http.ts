import { members } from '../../src/components/da-band/members';
import type { CurrentMember, MemberId } from '../../src/models/band-member';
import { getCurrentMember, requireAdmin } from './current-member';
import { isFailure, type Failure } from './failure';

// Shared by every band function. REST shape: ~/.claude/rules/api.md (resources returned bare, errors `{ error }`).
// Check order (contract 10): path shape → method → origin and content type on writes → path ids → identity → role →
// body shape → database lookups → validation that needs the looked-up row.

export const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store', ...headers }
	});

export const fail = (status: number, error: string, extra: Record<string, unknown> = {}) =>
	json(status, { error, ...extra });

/** A 201 for a newly created resource, with its URL in `Location`. */
export const created = (body: unknown, location: string) => json(201, body, { location });

/** A write must come from this site (403) and carry JSON (415). Returns the refusal, or undefined when it passes. */
export const checkWrite = (req: Request) => {
	if (req.headers.get('origin') !== new URL(req.url).origin) return fail(403, 'bad-origin');
	if (!req.headers.get('content-type')?.includes('application/json')) return fail(415, 'unsupported-media-type');
};

/** The parsed JSON body, or undefined when it isn't valid JSON. */
export const readBody = (req: Request) => req.json().catch(() => undefined) as Promise<unknown>;

/** The caller, or the 401 / 403 response. An unauthenticated request never reaches the database. */
export const authenticate = async (req: Request, admin = false): Promise<CurrentMember | Response> => {
	const current = admin ? await requireAdmin(req) : await getCurrentMember(req);
	if (current === 'signed-out') return fail(401, 'signed-out');
	if (current === 'not-a-member') return fail(403, 'not-a-member');
	if (current === 'not-admin') return fail(403, 'not-admin');

	return current;
};

/** A 405 with the `Allow` header HTTP requires: the methods this path does take. */
export const methodNotAllowed = (allow: string[]) =>
	json(405, { error: 'method-not-allowed' }, { allow: allow.join(', ') });

/** A database result as a response: a `Failure` becomes its status and `{ error, ...details }`; anything else is a 200. */
export const respond = (
	result: unknown | Failure,
	success: (value: any) => Response // eslint-disable-line @typescript-eslint/no-explicit-any
) => (isFailure(result) ? fail(result.status, result.error, result.details) : success(result));

/** The largest value of a Postgres `integer` column; a bigger id can't exist and would make the query throw. */
const MAX_DB_ID = 2147483647;

/** The numeric id in a path segment, or undefined (a 404) when it isn't a positive integer in the id columns' range. */
export const idFrom = (segment: string | undefined) => {
	if (!/^[1-9]\d{0,9}$/.test(segment ?? '')) return undefined;

	const id = Number(segment);
	return id <= MAX_DB_ID ? id : undefined;
};

/** The member id in a path segment, or undefined (a 404) when it isn't a band member. */
export const memberFrom = (segment: string | undefined): MemberId | undefined =>
	members.find(m => m.id === segment)?.id;

/** Path segments after /api/band/<resource>. */
export const subPath = (req: Request) => new URL(req.url).pathname.replace(/\/+$/, '').split('/').slice(4);
