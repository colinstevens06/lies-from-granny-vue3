import type { MemberId } from '../../models/band-member';
import type { Form } from '../../models/form';
import { availabilityMissing, type AvailabilityMissing } from '../../utils/availability';
import { isRecord, parsed, rejected, type Parsed } from '../../utils/parsed';
import type { SongPitch, SongPitchInput } from './model';

export const MAX_SUGGESTION = 160;

/** `wantsNew: false` has no suggestion; `wantsNew: true` needs one of 1–160 characters once trimmed. */
export const parseSongPitch = (body: unknown): Parsed<SongPitchInput> => {
	if (!isRecord(body) || typeof body.wantsNew !== 'boolean') return rejected('bad-body');
	if (body.suggestion !== undefined && typeof body.suggestion !== 'string') return rejected('bad-song');

	const suggestion = body.suggestion?.trim() ?? '';
	if (!body.wantsNew) return suggestion ? rejected('bad-song') : parsed({ wantsNew: false });
	if (suggestion.length < 1 || suggestion.length > MAX_SUGGESTION) return rejected('bad-song');

	return parsed({ wantsNew: true, suggestion });
};

/** The member's own pitch out of the form's details. */
export const mineOf = (form: Form, member: MemberId): SongPitch | undefined =>
	form.details.songPitches.find(pitch => pitch.member === member);

/** The song question is optional: no pitch counts as no suggestion, so only availability can be missing. */
export const missing = (form: Form, myDays: Record<string, unknown>, today: string): AvailabilityMissing =>
	form.availability ? availabilityMissing(form.availability, myDays, today) : { missingDays: 0 };
