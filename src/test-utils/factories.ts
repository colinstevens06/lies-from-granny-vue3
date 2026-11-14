import type { Answer, DayAnswer, MemberAvailability } from '../models/availability';
import type { MemberId } from '../models/band-member';
import type { Gig } from '../models/gig';
import type { Form } from '../models/form';
import type { Practice } from '../models/practice';

/** An availability form spanning Nov 2026 – Jan 2027. Override any field, including the nested `availability`. */
export const makeForm = (overrides: Partial<Form> = {}): Form => ({
	id: 1,
	slug: 'early-2027-planning',
	title: 'Early 2027 planning',
	dueDay: '2026-11-20',
	createdAt: '2026-11-01T12:00:00Z',
	availability: { startDay: '2026-11-10', endDay: '2027-01-31' },
	members: [],
	details: { slug: 'early-2027-planning', songPitches: [] },
	...overrides
});

/** A day's answer, or `{ answer: 'yes', showAnswer: 'no' }` for "Yes, no show" on a Friday or Saturday. */
export type DayInput = Answer | { answer: Answer; showAnswer?: Answer };

/** A Yes that can't play a show: `{ '2026-11-14': NO_SHOW }`. */
export const NO_SHOW: DayInput = { answer: 'yes', showAnswer: 'no' };

const dayFields = (input: DayInput) => (typeof input === 'string' ? { answer: input } : input);

/** A member's own answers keyed by day: `makeMyDays({ '2026-11-16': 'yes' })`. */
export const makeMyDays = (
	answers: Record<string, DayInput> = {}
): Record<string, Pick<DayAnswer, 'answer' | 'showAnswer'>> =>
	Object.fromEntries(Object.entries(answers).map(([day, input]) => [day, dayFields(input)]));

/** One member's row of the band's availability. */
export const makeAvailability = (member: MemberId, answers: Record<string, DayInput>): MemberAvailability => ({
	member,
	days: Object.fromEntries(
		Object.entries(answers).map(([day, input]) => [
			day,
			{ ...dayFields(input), source: 'self', updatedBy: member, updatedAt: '2026-11-01T12:00:00Z' } as DayAnswer
		])
	)
});

const ROSTER: MemberId[] = ['anna', 'kyle', 'nick', 'francesco', 'colin'];

/** Every member answering the same on the given days, except per-member overrides. */
export const makeBandAvailability = (
	days: string[],
	answer: Answer = 'yes',
	overrides: Partial<Record<MemberId, Partial<Record<string, DayInput>>>> = {}
): MemberAvailability[] =>
	ROSTER.map(member =>
		makeAvailability(
			member,
			Object.fromEntries(days.map(day => [day, overrides[member]?.[day] ?? answer])) as Record<string, DayInput>
		)
	);

export const makePractice = (overrides: Partial<Practice> = {}): Practice => ({
	id: 1,
	date: '2026-11-18',
	status: 'scheduled',
	...overrides
});

export const makeGig = (overrides: Partial<Gig> = {}): Gig => ({
	id: 1,
	name: 'Test show',
	date: 'December 5, 2026',
	text: [],
	img: '/images/test.png',
	imgAlt: 'Test',
	...overrides
});
