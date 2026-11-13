import { availabilitySummary } from '@utils/form-status';
import { availabilityTodoLine } from '@/forms/todo-lines';
import type { ClientForm } from '@/forms/index';
import type { SongPitch } from './model';

/** The non-component half of the client registration (the lazy screens are attached in src/forms/index.ts). */
export const early2027Planning: Pick<ClientForm, 'summary' | 'asks' | 'todoLines'> = {
	summary: form => [availabilitySummary(form), 'Songs'].filter(Boolean).join(' · '),

	asks: form => [
		form.availability
			? `Your availability for ${form.availability.startDay} to ${form.availability.endDay}`
			: 'Your availability',
		'Whether to add new songs for early 2027, and which'
	],

	todoLines(form, mine, context) {
		const pitch = mine as SongPitch | undefined;
		const songsMissing = context.missing.songsMissing === true;

		return [
			availabilityTodoLine(form, context),
			{
				label: 'Songs',
				value: songsMissing ? (pitch?.wantsNew ? 'Add a song, or choose No' : 'Not answered') : 'Answered ✓',
				ok: !songsMissing
			}
		];
	}
};
