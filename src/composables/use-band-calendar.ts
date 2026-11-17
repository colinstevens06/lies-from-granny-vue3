import type { Form } from '@models/form';
import { shows } from '@components/shows/shows';
import {
	calendarDayStatus,
	pickGroups as pickGroupsFor,
	possibleDates as possibleDatesFor,
	practicesStillNeeded as practicesStillNeededFor,
	showNights as showNightsFor,
	targetOf as targetOfFor
} from '@utils/da-band/band-calendar';
import { useEasternNow } from '@/composables/use-eastern-now';
import { useAvailabilityStore } from '@/stores/availability';
import { usePracticeStore } from '@/stores/practices';

/**
 * The one place availability, practices and `shows` are joined for the calendar and the date lists. Each function reads
 * the store and the reactive Eastern day, so a `computed` (or a template) that calls one re-runs when any of them
 * changes, including at midnight on a tab left open.
 */
export const useBandCalendar = () => {
	const availabilityStore = useAvailabilityStore();
	const practiceStore = usePracticeStore();
	const { now, today } = useEasternNow();

	/** A day's fill on the band calendar. */
	const dayStatus = (date: string) =>
		calendarDayStatus(date, availabilityStore.byMember, practiceStore.practices, shows);

	/** Upcoming unbooked days all five can practice, inside the form's range when there is one. */
	const possibleDates = (form?: Form) =>
		possibleDatesFor(form, availabilityStore.byMember, practiceStore.practices, shows, today.value);

	/** The Fridays and Saturdays among them that all five can also play. */
	const showNights = (form?: Form) =>
		showNightsFor(form, availabilityStore.byMember, practiceStore.practices, shows, today.value);

	/** How many practices the form still wants, or undefined when it doesn't say. */
	const practicesStillNeeded = (form: Form) => practicesStillNeededFor(form, practiceStore.practices, shows);

	/** What the form is scheduling toward: its gig if still upcoming, else its free-text label. */
	const targetOf = (form: Form) => targetOfFor(form, shows, today.value);

	/** The admin's lock-in groups for a form. */
	const pickGroups = (form: Form) =>
		pickGroupsFor(form, availabilityStore.byMember, practiceStore.practices, today.value, shows);

	return { now, today, dayStatus, possibleDates, showNights, practicesStillNeeded, targetOf, pickGroups };
};
