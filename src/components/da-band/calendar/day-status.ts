import type { DayStatus } from '@utils/band-calendar';
import type { LegendItem } from '@components/da-band/legend-keys.vue';

// How each band-calendar status looks, shared by the day cell and the legend so a swatch can't drift from its day.

export const STATUS_CLASS: Record<DayStatus, string> = {
	booked: 'bg-lfg-pink border-lfg-pink text-white',
	blocked: 'bg-gray-900 border-gray-900 text-white',
	gig: 'bg-lfg-pink-tint border-lfg-pink',
	possible: 'bg-poster-yellow border-poster-yellow',
	open: 'bg-white border-black-alpha-20'
};

export const STATUS_LABEL: Record<DayStatus, string> = {
	booked: 'booked',
	blocked: 'someone is busy',
	gig: 'everyone can play a show',
	possible: 'everyone can practice',
	open: 'open'
};

/** The four keys under the calendar (Open has none: it's the absence of the rest). */
export const CALENDAR_LEGEND: LegendItem[] = [
	{ label: 'Can practice', swatch: STATUS_CLASS.possible },
	{ label: 'Can gig', swatch: STATUS_CLASS.gig },
	{ label: "Someone can't", swatch: STATUS_CLASS.blocked },
	{ label: 'Booked', swatch: STATUS_CLASS.booked }
];
