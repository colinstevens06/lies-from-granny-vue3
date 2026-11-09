import type { Practice } from '@models/practice';

// PLACEHOLDER entries so the page has something to render. Replace every one with real practices.
// Dates and times are Eastern wall-clock strings; see the comment at the top of src/utils/dates.ts.
export const practices: Practice[] = [
	{
		id: 1,
		date: '2026-11-02',
		startTime: '19:00',
		endTime: '22:00',
		location: 'Location TBD',
		status: 'complete',
		recap: ['Placeholder recap: ran Wannabe and Break Stuff twice each.', 'Placeholder recap: cut Torn for now.']
	},
	{
		id: 2,
		date: '2026-11-16',
		startTime: '19:00',
		endTime: '22:00',
		location: 'Location TBD',
		status: 'scheduled',
		prepare: ['In the End', 'One Step Closer', 'Hands Down']
	},
	{
		id: 3,
		date: '2026-11-23',
		startTime: '19:00',
		endTime: '22:00',
		location: 'Location TBD',
		status: 'cancelled'
	},
	{
		id: 4,
		date: '2026-11-30',
		startTime: '19:00',
		endTime: '22:00',
		location: 'Location TBD',
		status: 'scheduled',
		prepare: ['Wannabe', 'Break Stuff']
	}
];
