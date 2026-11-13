import { members } from '../../src/components/band/members';
import type { Early2027PlanningDetails, SongPitch } from '../../src/forms/early-2027-planning/model';
import { parseSongPitch } from '../../src/forms/early-2027-planning/rules';
import type { MemberId } from '../../src/models/band-member';
import type { Queryable } from '../lib/band-db';
import { failure } from '../lib/failure';
import type { FormHandler } from '.';

const loadDetails = async (client: Queryable, formId: number): Promise<Early2027PlanningDetails> => {
	const [pitches, songs] = await Promise.all([
		client.query('select member_id, wants_new, answered_at from song_pitches where form_id = $1', [formId]),
		client.query(
			'select member_id, title, artist from song_suggestions where form_id = $1 order by member_id, position',
			[formId]
		)
	]);
	const order: string[] = members.map(m => m.id);

	const songPitches: SongPitch[] = pitches.rows
		.sort((a, b) => order.indexOf(a.member_id) - order.indexOf(b.member_id))
		.map(row => ({
			member: row.member_id as MemberId,
			wantsNew: row.wants_new,
			answeredAt: new Date(row.answered_at).toISOString(),
			songs: songs.rows.filter(s => s.member_id === row.member_id).map(({ title, artist }) => ({ title, artist }))
		}));

	return { slug: 'early-2027-planning', songPitches };
};

export const early2027Planning: FormHandler<Early2027PlanningDetails> = {
	loadDetails,

	/** The caller's own answer: parse first, then replace their pitch and songs (the caller holds the form's share lock). */
	async saveAnswer(client, form, member, body) {
		const pitch = parseSongPitch(body);
		if (!pitch.ok) return failure(400, pitch.error);

		await client.query(
			`insert into song_pitches (form_id, member_id, wants_new, answered_at) values ($1, $2, $3, now())
			 on conflict (form_id, member_id) do update set wants_new = excluded.wants_new, answered_at = now()`,
			[form.id, member, pitch.value.wantsNew]
		);
		await client.query('delete from song_suggestions where form_id = $1 and member_id = $2', [form.id, member]);
		if (pitch.value.songs.length > 0) {
			await client.query(
				`insert into song_suggestions (form_id, member_id, position, title, artist)
				 select $1::integer, $2::text, t.position, t.title, t.artist
				   from unnest($3::integer[], $4::text[], $5::text[]) as t(position, title, artist)`,
				[
					form.id,
					member,
					pitch.value.songs.map((_, i) => i + 1),
					pitch.value.songs.map(s => s.title),
					pitch.value.songs.map(s => s.artist)
				]
			);
		}

		return loadDetails(client, form.id);
	}
};
