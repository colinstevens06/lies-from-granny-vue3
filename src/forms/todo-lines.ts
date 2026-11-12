import type { Form } from '@models/form';
import { addDays, formatCalendarDate } from '@utils/dates';
import { prefilledCount } from '@utils/band-calendar';
import type { TodoContext, TodoLine } from '@/forms/index';

/** The to-do line for a form's availability part: "45 of 90", "Already on your calendar ✓" or "Done ✓". */
export const availabilityTodoLine = (form: Form, { myDays, today, missing }: TodoContext): TodoLine => {
	const { startDay, endDay } = form.availability!;
	const first = startDay > today ? startDay : today;

	let total = 0;
	for (let day = first; day <= endDay; day = addDays(day, 1)) total++;

	const missingDays = Number(missing.missingDays ?? 0);
	const prefilled = prefilledCount(form, myDays, today);
	const label = `Availability, ${formatCalendarDate(startDay, {
		month: 'short',
		day: 'numeric'
	})} – ${formatCalendarDate(endDay, { month: 'short', day: 'numeric' })}`;

	if (missingDays === 0)
		return { label, value: prefilled === total ? 'Already on your calendar ✓' : 'Done ✓', ok: true };

	return {
		label,
		value: `${total - missingDays} of ${total}${prefilled > 0 ? ` · ${prefilled} from your calendar` : ''}`,
		ok: false
	};
};
