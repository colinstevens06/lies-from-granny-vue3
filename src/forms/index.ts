import { defineAsyncComponent, type Component } from 'vue';
import type { Form, FormSlug } from '@models/form';
import { marchShowPlanning } from './march-show-planning';

// The client form registry: slug → how the app shows that form. Typed Record<FormSlug, …> so a missing registration
// fails `yarn type-check`. The sign-off rule lives in ./rules (shared with the server), never here.

/** One line on a to-do card or the progress bar. */
export interface TodoLine {
	label: string;
	value: string;
	ok: boolean;
}

/** What `todoLines` needs besides the form: the caller's own state. */
export interface TodoContext {
	/** The member's own availability, keyed by day. */
	myDays: Record<string, unknown>;
	/** Eastern 'YYYY-MM-DD'. */
	today: string;
	/** The rule's `missing` result for this member. */
	missing: Record<string, unknown>;
}

export interface ClientForm {
	/** A short line for the admin tile, e.g. "Dates Jan 1 – Mar 31 · Songs". */
	summary(form: Form): string;
	/** A short read-only list of what the form asks, for the admin's form page and tile. */
	asks(form: Form): string[];
	/** Lazy: the member's screen. Props: `form`. */
	screen: Component;
	/** Lazy: everyone's answers. Props: `form`. */
	responses: Component;
	/** Per-section lines for the to-do card and the progress bar. `mine` is the rule's `mineOf` result. */
	todoLines(form: Form, mine: unknown, context: TodoContext): TodoLine[];
}

export const clientForms: Record<FormSlug, ClientForm> = {
	'march-show-planning': {
		...marchShowPlanning,
		screen: defineAsyncComponent(() => import('./march-show-planning/screen.vue')),
		responses: defineAsyncComponent(() => import('./march-show-planning/responses.vue'))
	}
};

/** The registered form for a slug, or undefined when this build doesn't know it ("This form needs an app update."). */
export const clientFormFor = (slug: string): ClientForm | undefined =>
	Object.prototype.hasOwnProperty.call(clientForms, slug)
		? (clientForms as Record<string, ClientForm>)[slug]
		: undefined;
