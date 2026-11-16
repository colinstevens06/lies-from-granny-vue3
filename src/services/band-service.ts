import type { MemberAvailability } from '@models/availability';
import type { CurrentMember, MemberId } from '@models/band-member';
import type { Form } from '@models/form';
import type { Practice, PracticeInput } from '@models/practice';
import { bandHttp } from './band-service-base';

// Stateless: one method per /api/band endpoint, named by verb and returning the response body. Only `stores/band.ts`
// imports this.

export const bandService = {
	/** Who's signed in. Its 401 is the answer "signed out", so it doesn't redirect to login. */
	getMe: () => bandHttp.get<CurrentMember>('me', { redirectOn401: false }),

	getAvailability: () => bandHttp.get<MemberAvailability[]>('availability'),

	patchAvailability: (member: MemberId, changes: unknown[]) =>
		bandHttp.patch<MemberAvailability>(`availability/${member}`, { changes }),

	getForms: () => bandHttp.get<Form[]>('forms'),

	/** Admin: the only change a form takes is closing. */
	patchForm: (formId: number, patch: { closed: true }) => bandHttp.patch<Form>(`forms/${formId}`, patch),

	/** Admin: books the days as practices and closes the form. */
	putFormSchedule: (formId: number, days: string[]) => bandHttp.put<Practice[]>(`forms/${formId}/schedule`, { days }),

	/** A member's own row on a form: the only change is signing off. */
	patchFormMember: (formId: number, member: MemberId, patch: { signedOff: true }) =>
		bandHttp.patch<Form>(`forms/${formId}/members/${member}`, patch),

	putFormMemberAnswers: (formId: number, member: MemberId, body: unknown) =>
		bandHttp.put<Form>(`forms/${formId}/members/${member}/answers`, body),

	getPractices: () => bandHttp.get<Practice[]>('practices'),

	postPractice: (input: PracticeInput) => bandHttp.post<Practice>('practices', input),

	putPractice: (id: number, input: PracticeInput) => bandHttp.put<Practice>(`practices/${id}`, input)
};
