import type { MemberId } from '../../src/models/band-member';
import type { Form, FormDetails, FormSlug } from '../../src/models/form';
import { early2027Planning } from './early-2027-planning';
import type { Queryable } from '../lib/band-db';
import type { Failure } from '../lib/failure';

// The server form registry: slug → handler. One handler per registered form, typed Record<FormSlug, …> so a
// missing registration fails `yarn type-check`.

export interface FormHandler<D> {
	/** Everyone's answers, for GET. */
	loadDetails(client: Queryable, formId: number): Promise<D>;
	/** The caller's own answers only. Parse before writing anything. */
	saveAnswer?(client: Queryable, form: Form, member: MemberId, body: unknown): Promise<D | Failure>;
}

export const formHandlers: Record<FormSlug, FormHandler<FormDetails>> = {
	'early-2027-planning': early2027Planning
};

/** The handler for a slug, or undefined for a slug this build doesn't know (an old preview branch, a rollback). */
export const handlerFor = (slug: string): FormHandler<FormDetails> | undefined =>
	Object.prototype.hasOwnProperty.call(formHandlers, slug)
		? (formHandlers as Record<string, FormHandler<FormDetails>>)[slug]
		: undefined;
