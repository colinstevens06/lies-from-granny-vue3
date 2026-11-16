import type { MemberAvailability } from '@models/availability';
import type { CurrentMember, MemberId } from '@models/band-member';
import type { Form } from '@models/form';
import type { Practice, PracticeInput } from '@models/practice';
import { ServiceBase } from './service-base';

/**
 * Stateless: one method per /api/band endpoint, named by verb and returning the response body. Only the stores in
 * `src/stores/` import this.
 */
class BandService extends ServiceBase {
	constructor() {
		super('/api/band');
	}

	/** Renews the Identity token first, so a member isn't sent back to Google an hour after signing in. */
	protected override async beforeRequest() {
		// Local testing: a chosen member has no Identity session to renew.
		if (import.meta.env.DEV && (await import('@utils/da-band/auth/dev-auth')).getDevMember()) return;

		await (await import('@utils/da-band/auth/auth')).refreshIfNeeded();
	}

	/** Local testing only: in a production build `import.meta.env.DEV` is false, so dev-auth is dropped from the bundle. */
	protected override async requestHeaders() {
		if (!import.meta.env.DEV) return {};

		return (await import('@utils/da-band/auth/dev-auth')).devHeaders();
	}

	/** A 401 means the Identity session ended: off to login, coming back here after. */
	protected override async onUnauthorized() {
		const { default: router } = await import('@router/index');
		await router.push({ name: 'da-band-login', query: { redirect: router.currentRoute.value.fullPath } });
	}

	/** Who's signed in. Its 401 is the answer "signed out", so it doesn't redirect to login. */
	getMe() {
		return this.get<CurrentMember>('me', { handleUnauthorized: false });
	}

	getAvailability() {
		return this.get<MemberAvailability[]>('availability');
	}

	patchAvailability(member: MemberId, changes: unknown[]) {
		return this.patch<MemberAvailability>(`availability/${member}`, { changes });
	}

	getForms() {
		return this.get<Form[]>('forms');
	}

	/** Admin: the only change a form takes is closing. */
	patchForm(formId: number, patch: { closed: true }) {
		return this.patch<Form>(`forms/${formId}`, patch);
	}

	/** Admin: books the days as practices and closes the form. */
	putFormSchedule(formId: number, days: string[]) {
		return this.put<Practice[]>(`forms/${formId}/schedule`, { days });
	}

	/** A member's own row on a form: the only change is signing off. */
	patchFormMember(formId: number, member: MemberId, patch: { signedOff: true }) {
		return this.patch<Form>(`forms/${formId}/members/${member}`, patch);
	}

	putFormMemberAnswers(formId: number, member: MemberId, body: object) {
		return this.put<Form>(`forms/${formId}/members/${member}/answers`, body);
	}

	getPractices() {
		return this.get<Practice[]>('practices');
	}

	postPractice(input: PracticeInput) {
		return this.post<Practice>('practices', input);
	}

	putPractice(id: number, input: PracticeInput) {
		return this.put<Practice>(`practices/${id}`, input);
	}
}

export const bandService = new BandService();
