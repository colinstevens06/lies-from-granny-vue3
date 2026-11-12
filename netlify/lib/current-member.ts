import { getUser } from '@netlify/identity';
import { members } from '../../src/components/band/members';
import type { CurrentMember, MemberId } from '../../src/models/band-member';

// The only importer of @netlify/identity on the server.

const memberIds: string[] = members.map(m => m.id);

export type MemberLookup = CurrentMember | 'signed-out' | 'not-a-member';

/**
 * Members map through Identity roles: each user has exactly one member slug as a role (`nick`), and Colin also has
 * `admin`. Any other role is ignored. No slug, or more than one, is `not-a-member`. A role change reaches the token
 * on its next refresh (up to an hour) or when the user signs out and back in.
 */
export const getCurrentMember = async (): Promise<MemberLookup> => {
	const user = await getUser();
	if (!user) return 'signed-out';

	const roles = user.roles ?? [];
	const slugs = roles.filter(role => memberIds.includes(role));
	if (slugs.length !== 1) return 'not-a-member';

	return { member: slugs[0] as MemberId, role: roles.includes('admin') ? 'admin' : 'member' };
};

/** The signed-in admin, or the lookup failure / `'not-admin'`. */
export const requireAdmin = async (): Promise<CurrentMember | Exclude<MemberLookup, CurrentMember> | 'not-admin'> => {
	const current = await getCurrentMember();
	if (typeof current === 'string') return current;

	return current.role === 'admin' ? current : 'not-admin';
};
