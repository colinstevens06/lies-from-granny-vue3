import type { BandMember } from '../../models/band-member';

/** Roster order. No emails here: the repo is public, and members map to people through Identity roles. */
export const members: BandMember[] = [
	{ id: 'anna', name: 'Anna' },
	{ id: 'kyle', name: 'Kyle' },
	{ id: 'nick', name: 'Nick' },
	{ id: 'francesco', name: 'Fran' },
	{ id: 'colin', name: 'Colin' }
];

/** A member's name for display, or the id itself when it isn't on the roster. */
export const memberName = (id: string) => members.find(m => m.id === id)?.name ?? id;
