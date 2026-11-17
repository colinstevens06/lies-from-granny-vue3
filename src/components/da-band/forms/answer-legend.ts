import type { LegendItem } from '@components/da-band/legend-keys.vue';

/**
 * The color key for the answer cells, shared by the sign-off form's grid and Edit my availability. Listed alphabetically. The cells keep their
 * short Yes / No wording; the key says what each one means (Colin, 2026-11-16).
 */
export const ANSWER_LEGEND: LegendItem[] = [
	{ label: 'Blank', swatch: 'answer-cell--none' },
	{ label: 'Busy', swatch: 'answer-cell--no' },
	{ label: 'Not sure', swatch: 'answer-cell--maybe' },
	{ label: 'Yes', swatch: 'answer-cell--yes' },
	{ label: 'Yes for practice, No for show (Fri, Sat)', swatch: 'answer-cell--yes', band: true }
];
