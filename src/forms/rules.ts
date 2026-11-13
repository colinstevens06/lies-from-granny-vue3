import type { MemberId } from '../models/band-member';
import type { Form, FormSlug } from '../models/form';
import { mineOf, missing } from './early-2027-planning/rules';

// The shared rule registry. The server's sign-off and the client's Sign off button both call `mineOf`, then
// `missing`, on the same `Form` shape, so they can't disagree. Import no .vue files and nothing from
// src/forms/index.ts here.

export interface FormRule {
	/** The member's own answers, picked out of `form.details`. */
	mineOf(form: Form, member: MemberId): unknown;
	/** What's still unanswered. `done` is true when the member may sign off. */
	missing(
		form: Form,
		myDays: Record<string, unknown>,
		mine: unknown,
		today: string
	): { done: boolean } & Record<string, unknown>;
}

export const formRules: Record<FormSlug, FormRule> = {
	'early-2027-planning': {
		mineOf,
		missing: (form, myDays, mine, today) => {
			const result = missing(form, myDays, mine as ReturnType<typeof mineOf>, today);
			return { ...result, done: result.missingDays === 0 && !result.songsMissing };
		}
	}
};

/** The rule for a slug, or undefined for a slug this build doesn't know. */
export const ruleFor = (slug: string): FormRule | undefined =>
	Object.prototype.hasOwnProperty.call(formRules, slug) ? (formRules as Record<string, FormRule>)[slug] : undefined;
