import type { MemberAvailability } from '@models/availability';
import type { CurrentMember, MemberId } from '@models/band-member';
import type { Form } from '@models/form';
import type { Practice, PracticeInput } from '@models/practice';
import { bandRequest } from './band-service-base';

// Stateless: one method per /api/band endpoint, returning the response body. Only `stores/band.ts` imports this, and
// only inside its actions, so the API code stays out of the main bundle (nav.vue imports the store).

export const bandService = {
	/** Who's signed in. Its 401 is the answer "signed out", so it doesn't redirect to login. */
	me: () => bandRequest<CurrentMember>('me', { redirectOn401: false }),

	availability: () => bandRequest<{ members: MemberAvailability[] }>('availability'),

	saveAvailability: (member: MemberId, changes: unknown[]) =>
		bandRequest<{ availability: MemberAvailability }>(`availability/${member}`, {
			method: 'PATCH',
			body: { changes }
		}),

	forms: () => bandRequest<{ forms: Form[] }>('forms'),

	saveFormAnswers: (formId: number, body: unknown) =>
		bandRequest<{ form: Form }>(`forms/${formId}/answers`, { method: 'PUT', body }),

	signOff: (formId: number) => bandRequest<{ form: Form }>(`forms/${formId}/sign-off`, { method: 'POST' }),

	lockIn: (formId: number, days: string[]) =>
		bandRequest(`forms/${formId}/lock-in`, { method: 'POST', body: { days } }),

	closeForm: (formId: number) => bandRequest<{ form: Form }>(`forms/${formId}/close`, { method: 'POST' }),

	practices: () => bandRequest<{ practices: Practice[] }>('practices'),

	/** Creates a practice (no `id`) or replaces one (whole record). */
	savePractice: (input: PracticeInput, id?: number) =>
		bandRequest<{ practice: Practice }>(id === undefined ? 'practices' : `practices/${id}`, {
			method: id === undefined ? 'POST' : 'PUT',
			body: input
		})
};
