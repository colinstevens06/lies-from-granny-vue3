/** Member ids are slugs. Keep this list in step with the `members` rows in netlify/database/migrations/0001_band_availability.sql. */
export type MemberId = 'anna' | 'kyle' | 'nick' | 'francesco' | 'colin';

/** What a signed-in member may do. `admin` is enforced on the server; the UI never names who it is. */
export type BandRole = 'admin' | 'member';

export interface BandMember {
	id: MemberId;
	name: string;
	/** The short name used under calendar dots and in sheets. */
	short: string;
}

export interface CurrentMember {
	member: MemberId;
	role: BandRole;
}
