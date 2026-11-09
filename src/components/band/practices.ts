import type { Practice } from '@models/practice';

// Dates and times are Eastern wall-clock strings; see the comment at the top of src/utils/dates.ts.
// Leave startTime and endTime off until they're known; the page shows 'Time TBD'.
// Leave location off for the usual spot (Burtonsville); set it only when practice is somewhere else.
export const practices: Practice[] = [
	{
		id: 1,
		date: '2026-12-06',
		status: 'tentative'
	}
];
