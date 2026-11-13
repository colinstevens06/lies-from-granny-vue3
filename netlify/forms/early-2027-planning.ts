import { members } from '../../src/components/band/members';
import type { Early2027PlanningDetails, SongPitch } from '../../src/forms/early-2027-planning/model';
import { parseSongPitch } from '../../src/forms/early-2027-planning/rules';
import type { MemberId } from '../../src/models/band-member';
import type { Queryable } from '../lib/band-db';
import { failure } from '../lib/failure';
import type { FormHandler } from '.';

const loadDetails = async (client: Queryable, formId: number): Promise<Early2027PlanningDetails> => {
	const { rows } = await client.query(
		'select member_id, wants_new, suggestion, answered_at from song_pitches where form_id = $1',
		[formId]
	);
	const order: string[] = members.map(m => m.id);

	const songPitches: SongPitch[] = rows
		.sort((a, b) => order.indexOf(a.member_id) - order.indexOf(b.member_id))
		.map(row => ({
			member: row.member_id as MemberId,
			wantsNew: row.wants_new,
			answeredAt: new Date(row.answered_at).toISOString(),
			...(row.suggestion === null ? {} : { suggestion: row.suggestion })
		}));

	return { slug: 'early-2027-planning', songPitches };
};

export const early2027Planning: FormHandler<Early2027PlanningDetails> = {
	loadDetails,

	/** The caller's own answer: parse first, then replace their pitch (the caller holds the form's share lock). */
	async saveAnswer(client, form, member, body) {
		const pitch = parseSongPitch(body);
		if (!pitch.ok) return failure(400, pitch.error);

		await client.query(
			`insert into song_pitches (form_id, member_id, wants_new, suggestion, answered_at) values ($1, $2, $3, $4, now())
			 on conflict (form_id, member_id) do update
			   set wants_new = excluded.wants_new, suggestion = excluded.suggestion, answered_at = now()`,
			[form.id, member, pitch.value.wantsNew, pitch.value.suggestion ?? null]
		);

		return loadDetails(client, form.id);
	}
};
