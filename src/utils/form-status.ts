import type { Form } from '@models/form';
import { formatCalendarDate } from '@utils/dates';

export const signedOffCount = (form: Form) => form.members.filter(m => m.signedOffAt).length;

export const isEveryoneIn = (form: Form) => signedOffCount(form) === form.members.length;

/** The pill on a form's tile and page. */
export const formStateLabel = (form: Form) => {
	if (form.closedAt) return 'Closed';
	if (isEveryoneIn(form)) return form.availability ? "Everyone's in · pick dates" : "Everyone's in";

	return `${signedOffCount(form)} of ${form.members.length} signed off`;
};

/** 'Nov 29' */
export const formatDueDay = (form: Form) => formatCalendarDate(form.dueDay, { month: 'short', day: 'numeric' });

/** A short line about what a form asks for, from its availability alone (the registry adds its own parts). */
export const availabilitySummary = (form: Form) =>
	form.availability
		? `Dates ${formatCalendarDate(form.availability.startDay, {
				month: 'short',
				day: 'numeric'
		  })} – ${formatCalendarDate(form.availability.endDay, { month: 'short', day: 'numeric' })}`
		: undefined;
