import type { Form } from '@models/form';
import { daysFrom, formatMonthDayRange } from '@utils/dates';
import { prefilledCount } from '@utils/da-band/band-calendar';
import type { TodoContext, TodoLine } from '@/forms/index';

/** The to-do line for a form's availability part: "45 of 90 done", "Already on your calendar ✓" or "Done ✓". */
export const availabilityTodoLine = (form: Form, { myDays, today, missing }: TodoContext): TodoLine => {
	const { startDay, endDay } = form.availability!;
	const total = daysFrom(startDay, endDay, today).length;

	const missingDays = Number(missing.missingDays ?? 0);
	const prefilled = prefilledCount(form, myDays, today);
	const label = `Availability, ${formatMonthDayRange(startDay, endDay)}`;

	if (missingDays === 0)
		return { label, value: prefilled === total ? 'Already on your calendar ✓' : 'Done ✓', ok: true };

	return {
		label,
		value: `${total - missingDays} of ${total} done`,
		ok: false
	};
};
