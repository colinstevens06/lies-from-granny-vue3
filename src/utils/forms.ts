import type { Form } from '../models/form';
import { isIsoDate } from './dates';
import { isRecord, parsed, rejected, type Parsed } from './parsed';

/** One or more distinct days, each inside the form's availability range and on or after today. */
export const parseLockIn = (body: unknown, form: Form, today: string): Parsed<{ days: string[] }> => {
	if (!form.availability) return rejected('no-availability');
	if (!isRecord(body) || !Array.isArray(body.days) || body.days.length === 0 || body.days.length > 400) {
		return rejected('bad-days');
	}

	const { startDay, endDay } = form.availability;
	const days: string[] = [];
	for (const day of body.days) {
		if (!isIsoDate(day) || days.includes(day)) return rejected('bad-days');
		if (day < startDay || day > endDay || day < today) return rejected('date-out-of-range');
		days.push(day);
	}

	return parsed({ days: days.sort() });
};
