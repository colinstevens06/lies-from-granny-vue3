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

	getAvailability: () => bandHttp.get<{ members: MemberAvailability[] }>('availability'),

	patchAvailability: (member: MemberId, changes: unknown[]) =>
		bandHttp.patch<{ availability: MemberAvailability }>(`availability/${member}`, { changes }),

	getForms: () => bandHttp.get<{ forms: Form[] }>('forms'),

	putFormAnswers: (formId: number, body: unknown) => bandHttp.put<{ form: Form }>(`forms/${formId}/answers`, body),

	postSignOff: (formId: number) => bandHttp.post<{ form: Form }>(`forms/${formId}/sign-off`),

	postLockIn: (formId: number, days: string[]) => bandHttp.post(`forms/${formId}/lock-in`, { days }),

	postCloseForm: (formId: number) => bandHttp.post<{ form: Form }>(`forms/${formId}/close`),

	getPractices: () => bandHttp.get<{ practices: Practice[] }>('practices'),

	postPractice: (input: PracticeInput) => bandHttp.post<{ practice: Practice }>('practices', input),

	putPractice: (id: number, input: PracticeInput) => bandHttp.put<{ practice: Practice }>(`practices/${id}`, input)
};
