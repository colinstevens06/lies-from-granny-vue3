import { describe, expect, it } from 'vitest';
import { makeForm, makeMyDays } from '../test-utils/factories';
import { mineOf as songMineOf, missing, parseSongPitch } from './early-2027-planning/rules';
import { ruleFor } from './rules';

const TODAY = '2026-11-13';
const form = makeForm({ availability: { startDay: '2026-11-13', endDay: '2026-11-15' } });
const allAnswered = makeMyDays({ '2026-11-13': 'yes', '2026-11-14': 'no', '2026-11-15': 'maybe' });

describe('shared sign-off rule', () => {
	const rule = ruleFor('early-2027-planning')!;

	it('knows registered slugs only', () => {
		expect(rule).toBeDefined();
		expect(ruleFor('toString')).toBeUndefined();
		expect(ruleFor('nope')).toBeUndefined();
	});

	it('is done with every day answered and no song pitch (the song is optional)', () => {
		const mine = rule.mineOf(form, 'anna');
		expect(mine).toBeUndefined();
		expect(rule.missing(form, allAnswered, mine, TODAY)).toMatchObject({ done: true, missingDays: 0 });
	});

	it('is not done while a day is blank, and names the first blank day', () => {
		const result = rule.missing(form, makeMyDays({ '2026-11-13': 'yes' }), undefined, TODAY);
		expect(result).toMatchObject({ done: false, missingDays: 2, firstMissing: '2026-11-14' });
	});

	it('ignores past days', () => {
		const result = rule.missing(
			form,
			makeMyDays({ '2026-11-14': 'yes', '2026-11-15': 'yes' }),
			undefined,
			'2026-11-14'
		);
		expect(result.done).toBe(true);
	});
});

describe('early-2027-planning rules', () => {
	it('finds the member’s own pitch', () => {
		const withPitch = makeForm({
			details: {
				slug: 'early-2027-planning',
				songPitches: [{ member: 'kyle', wantsNew: false, answeredAt: '2026-11-02T00:00:00Z' }]
			}
		});
		expect(songMineOf(withPitch, 'kyle')?.wantsNew).toBe(false);
		expect(songMineOf(withPitch, 'anna')).toBeUndefined();
	});

	it('a form with no availability has nothing missing', () => {
		expect(missing(makeForm({ availability: undefined }), {}, TODAY)).toEqual({ missingDays: 0 });
	});

	it('parseSongPitch: No takes no text, Yes needs 1–160 characters once trimmed', () => {
		expect(parseSongPitch({ wantsNew: false })).toMatchObject({ value: { wantsNew: false } });
		expect(parseSongPitch({ wantsNew: true, suggestion: '  Song – Artist ' })).toMatchObject({
			value: { wantsNew: true, suggestion: 'Song – Artist' }
		});
		expect(JSON.stringify(parseSongPitch({ wantsNew: true, suggestion: '   ' }))).toContain('bad-song');
		expect(JSON.stringify(parseSongPitch({ wantsNew: true }))).toContain('bad-song');
		expect(JSON.stringify(parseSongPitch({ wantsNew: true, suggestion: 'x'.repeat(161) }))).toContain('bad-song');
		expect(JSON.stringify(parseSongPitch({ wantsNew: false, suggestion: 'x' }))).toContain('bad-song');
		expect(parseSongPitch('nope')).toEqual({ ok: false, error: 'bad-body' });
	});
});
