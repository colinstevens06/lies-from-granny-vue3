import type { Form } from '../../models/form';
import type { Practice } from '../../models/practice';
import { MAX_DAYS_PER_REQUEST } from './availability';
import { isIsoDate } from '../dates';
import type { Parsed } from '../../models/parsed';
import { isRecord, parsed, rejected } from '../parsed';

/** One or more distinct days, each inside the form's availability range and on or after today. */
export const parseLockIn = (body: unknown, form: Form, today: string): Parsed<{ days: string[] }> => {
	if (!form.availability) return rejected('no-availability');
	if (
		!isRecord(body) ||
		!Array.isArray(body.days) ||
		body.days.length === 0 ||
		body.days.length > MAX_DAYS_PER_REQUEST
	) {
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

/**
 * A retry of a lock-in that already went through: the form is closed and its practices are exactly the days asked for.
 * Compared without `parseLockIn`'s date checks, so a retry still matches after those days have passed.
 */
export const repeatsLockIn = (body: unknown, practices: Pick<Practice, 'date' | 'status'>[]) => {
	if (!isRecord(body) || !Array.isArray(body.days)) return false;

	const asked = [...new Set(body.days)].sort();
	const booked = practices
		.filter(p => p.status !== 'cancelled')
		.map(p => p.date)
		.sort();
	return asked.length > 0 && asked.length === booked.length && asked.every((day, i) => day === booked[i]);
};

/**
 * A PATCH body whose one allowed change is setting `field` to true: a form closes but never reopens, and a sign-off is
 * never taken back. Other fields are ignored.
 */
export const parseFlagPatch = <K extends string>(body: unknown, field: K): Parsed<Record<K, true>> =>
	isRecord(body) && body[field] === true ? parsed({ [field]: true } as Record<K, true>) : rejected('bad-body');
