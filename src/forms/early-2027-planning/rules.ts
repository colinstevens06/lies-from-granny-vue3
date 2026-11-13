import type { MemberId } from '../../models/band-member';
import type { Form } from '../../models/form';
import { availabilityMissing, type AvailabilityMissing } from '../../utils/availability';
import { isRecord, parsed, rejected, type Parsed } from '../../utils/parsed';
import type { SongPitch, SongPitchInput } from './model';

const MAX_SONGS = 20;
const MAX_TEXT = 120;

/** `wantsNew: false` has no songs; `wantsNew: true` takes 0–20 songs, each with a title and artist of 1–120 characters. */
export const parseSongPitch = (body: unknown): Parsed<Required<SongPitchInput>> => {
	if (!isRecord(body) || typeof body.wantsNew !== 'boolean') return rejected('bad-body');

	const raw = body.songs ?? [];
	if (!Array.isArray(raw) || raw.length > MAX_SONGS || (!body.wantsNew && raw.length > 0)) return rejected('bad-songs');

	const songs = [];
	for (const item of raw) {
		const title = isRecord(item) && typeof item.title === 'string' ? item.title.trim() : '';
		const artist = isRecord(item) && typeof item.artist === 'string' ? item.artist.trim() : '';
		if (title.length < 1 || title.length > MAX_TEXT || artist.length < 1 || artist.length > MAX_TEXT) {
			return rejected('bad-songs');
		}
		songs.push({ title, artist });
	}

	return parsed({ wantsNew: body.wantsNew, songs });
};

/** The member's own pitch out of the form's details. */
export const mineOf = (form: Form, member: MemberId): SongPitch | undefined =>
	form.details.songPitches.find(pitch => pitch.member === member);

export interface Early2027PlanningMissing extends AvailabilityMissing {
	/** True when there's no pitch, or when "yes, new songs" lists none. */
	songsMissing: boolean;
}

export const missing = (
	form: Form,
	myDays: Record<string, unknown>,
	myPitch: SongPitch | undefined,
	today: string
): Early2027PlanningMissing => ({
	...(form.availability ? availabilityMissing(form.availability, myDays, today) : { missingDays: 0 }),
	songsMissing: !myPitch || (myPitch.wantsNew && myPitch.songs.length === 0)
});
