import type { Form } from '@models/form';
import type { MemberAvailability } from '@models/availability';
import type { MemberId } from '@models/band-member';
import { daysBetween, EASTERN, formatCalendarDate } from '@utils/dates';

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

/** Members who haven't signed off yet, in roster order. */
export const waitingOn = (form: Form): MemberId[] => form.members.filter(m => !m.signedOffAt).map(m => m.member);

/** Days in the form's range. Undefined when the form has no availability. */
export const rangeDayCount = (form: Form) =>
	form.availability ? daysBetween(form.availability.startDay, form.availability.endDay) + 1 : undefined;

/** How many days in the form's range a member has answered. */
export const answeredCount = (form: Form, row?: MemberAvailability) => {
	if (!form.availability || !row) return 0;

	const { startDay, endDay } = form.availability;
	return Object.keys(row.days).filter(day => day >= startDay && day <= endDay).length;
};

/** 'Nov 20' for an ISO instant, in Eastern time. */
export const formatInstantDay = (instant: string) =>
	new Intl.DateTimeFormat('en-US', { timeZone: EASTERN, month: 'short', day: 'numeric' }).format(new Date(instant));
