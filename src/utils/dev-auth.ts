// LOCAL TESTING ONLY. Imported only behind `import.meta.env.DEV`, so the production bundle never contains it.
// The server half is `devMemberFrom` in netlify/lib/current-member.ts, which also refuses to run outside `netlify dev`.

import type { MemberId } from '@models/band-member';

const KEY = 'da-band-dev-member';
const HEADER = 'x-dev-member';

export const getDevMember = (): MemberId | undefined => (sessionStorage.getItem(KEY) as MemberId | null) ?? undefined;

export const setDevMember = (member: MemberId) => sessionStorage.setItem(KEY, member);

export const clearDevMember = () => sessionStorage.removeItem(KEY);

/** Headers that make `band-api` calls act as the chosen member, or none. */
export const devHeaders = (): Record<string, string> => {
	const member = getDevMember();
	return member ? { [HEADER]: member } : {};
};
