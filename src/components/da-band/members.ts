import type { BandMember } from '../../models/band-member';

/** Roster order. No emails here: the repo is public, and members map to people through Identity roles. */
export const members: BandMember[] = [
	{ id: 'anna', name: 'Anna', short: 'Anna' },
	{ id: 'kyle', name: 'Kyle', short: 'Fives' },
	{ id: 'nick', name: 'Nick', short: 'Hermes' },
	{ id: 'francesco', name: 'Francesco', short: 'Franny' },
	{ id: 'colin', name: 'Colin', short: 'Colin' }
];
