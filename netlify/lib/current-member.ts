import { getUser } from '@netlify/identity';
import { members } from '../../src/components/band/members';
import type { CurrentMember, MemberId } from '../../src/models/band-member';

// The only importer of @netlify/identity on the server.

const memberIds: string[] = members.map(m => m.id);

export type MemberLookup = CurrentMember | 'signed-out' | 'not-a-member';

/**
 * LOCAL TESTING ONLY. Google sign-in can't work under `netlify dev` (Identity isn't proxied, and its OAuth state
 * returns to production), so a request may name a member in this header. Every one of these must hold, or the
 * header is ignored and the real Identity path runs:
 *   - `NETLIFY_DEV`, `NETLIFY_LOCAL` and `CONTEXT` are exactly what `netlify dev` sets: 'true', 'true' and 'dev'.
 *     A deployed function has none of them, and a missing or odd value means off.
 *   - the request's own host is localhost or 127.0.0.1.
 *   - the header names a known member id.
 */
const DEV_MEMBER_HEADER = 'x-dev-member';

const isNetlifyDev = (req: Request) =>
	process.env.NETLIFY_DEV === 'true' &&
	process.env.NETLIFY_LOCAL === 'true' &&
	process.env.CONTEXT === 'dev' &&
	['localhost', '127.0.0.1'].includes(new URL(req.url).hostname);

const devMemberFrom = (req?: Request): CurrentMember | undefined => {
	if (!req || !isNetlifyDev(req)) return undefined;

	const id = req.headers.get(DEV_MEMBER_HEADER);
	if (!id || !memberIds.includes(id)) return undefined;

	// As in production: Colin is the admin.
	return { member: id as MemberId, role: id === 'colin' ? 'admin' : 'member' };
};

/**
 * Members map through Identity roles: each user has exactly one member slug as a role (`nick`), and Colin also has
 * `admin`. Any other role is ignored. No slug, or more than one, is `not-a-member`. A role change reaches the token
 * on its next refresh (up to an hour) or when the user signs out and back in.
 */
export const getCurrentMember = async (req?: Request): Promise<MemberLookup> => {
	const dev = devMemberFrom(req);
	if (dev) return dev;

	const user = await getUser();
	if (!user) return 'signed-out';

	const roles = user.roles ?? [];
	const slugs = roles.filter(role => memberIds.includes(role));
	if (slugs.length !== 1) return 'not-a-member';

	return { member: slugs[0] as MemberId, role: roles.includes('admin') ? 'admin' : 'member' };
};

/** The signed-in admin, or the lookup failure / `'not-admin'`. */
export const requireAdmin = async (
	req?: Request
): Promise<CurrentMember | Exclude<MemberLookup, CurrentMember> | 'not-admin'> => {
	const current = await getCurrentMember(req);
	if (typeof current === 'string') return current;

	return current.role === 'admin' ? current : 'not-admin';
};
