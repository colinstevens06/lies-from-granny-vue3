import type { MemberId } from '../../models/band-member';

export interface SongPitch {
	member: MemberId;
	wantsNew: boolean;
	/** ISO UTC instant. */
	answeredAt: string;
	/** "Song – Artist" as typed. Present exactly when `wantsNew` is true. */
	suggestion?: string;
}

export interface Early2027PlanningDetails {
	slug: 'early-2027-planning';
	songPitches: SongPitch[];
}

export interface SongPitchInput {
	wantsNew: boolean;
	suggestion?: string;
}
