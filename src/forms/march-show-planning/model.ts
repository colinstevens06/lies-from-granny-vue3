import type { MemberId } from '../../models/band-member';

export interface SongSuggestion {
	title: string;
	artist: string;
}

export interface SongPitch {
	member: MemberId;
	wantsNew: boolean;
	/** ISO UTC instant. */
	answeredAt: string;
	/** In position order. */
	songs: SongSuggestion[];
}

export interface MarchShowPlanningDetails {
	slug: 'march-show-planning';
	songPitches: SongPitch[];
}

export interface SongPitchInput {
	wantsNew: boolean;
	songs?: SongSuggestion[];
}
