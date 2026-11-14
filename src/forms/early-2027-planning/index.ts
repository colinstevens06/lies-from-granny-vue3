import { availabilitySummary } from '@utils/form-status';
import { availabilityTodoLine } from '@/forms/todo-lines';
import type { ClientForm } from '@/forms/index';
import type { SongPitch } from './model';

/** The non-component half of the client registration (the lazy screens are attached in src/forms/index.ts). */
export const early2027Planning: Pick<ClientForm, 'summary' | 'asks' | 'todoLines'> = {
	summary: form => [availabilitySummary(form), 'Song'].filter(Boolean).join(' · '),

	asks: form => [
		form.availability
			? `Your availability for ${form.availability.startDay} to ${form.availability.endDay}`
			: 'Your availability',
		"Optional: a new song you'd like to suggest"
	],

	todoLines(form, mine, context) {
		const pitch = mine as SongPitch | undefined;

		// Optional: never outstanding, so it reads as done whether or not they suggested a song.
		return [
			availabilityTodoLine(form, context),
			{ label: 'New song (optional)', value: pitch?.wantsNew ? 'Suggested ✓' : 'No suggestion ✓', ok: true }
		];
	}
};
