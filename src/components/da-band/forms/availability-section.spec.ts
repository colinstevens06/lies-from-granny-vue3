import { afterEach, describe, expect, it } from 'vitest';
import { makeForm, makeMyDays } from '../../../test-utils/factories';
import { mountWithPrime } from '../../../test-utils/mount';
import AvailabilitySection from './availability-section.vue';
import WeekdayFillSheet from './weekday-fill-sheet.vue';

// 2026-11-16 is a Monday. The form runs Nov 16 – Nov 30: Mondays are the 16th, 23rd and 30th; the 9th is past.
const TODAY = '2026-11-16';
const form = makeForm({ availability: { startDay: '2026-11-09', endDay: '2026-11-30' } });
const MON = 1;

const mountSection = (myDays = makeMyDays()) => {
	const wrapper = mountWithPrime(AvailabilitySection, { props: { form, myDays, today: TODAY } });
	const sheet = wrapper.getComponent(WeekdayFillSheet);
	return { wrapper, sheet };
};

afterEach(() => {
	document.body.innerHTML = '';
});

describe('availability-section weekday fill', () => {
	it('counts only today-onward days, blanks vs all', () => {
		const { sheet } = mountSection(makeMyDays({ '2026-11-23': 'no' }));
		expect(sheet.props('blankCounts')[MON]).toBe(2); // 16, 30 (23 answered, 9 past)
		expect(sheet.props('dayCounts')[MON]).toBe(3);
	});

	it('fills only blank future days by default', () => {
		const { wrapper, sheet } = mountSection(makeMyDays({ '2026-11-23': 'no' }));
		sheet.vm.$emit('fill', MON, 'yes', false);
		expect(wrapper.emitted('change')).toEqual([
			[
				[
					{ date: '2026-11-16', answer: 'yes' },
					{ date: '2026-11-30', answer: 'yes' }
				],
				true
			]
		]);
	});

	it('with overwrite, sends only future days whose answer would change', () => {
		const { wrapper, sheet } = mountSection(makeMyDays({ '2026-11-16': 'yes', '2026-11-23': 'no' }));
		sheet.vm.$emit('fill', MON, 'yes', true);
		expect(wrapper.emitted('change')).toEqual([
			[
				[
					{ date: '2026-11-23', answer: 'yes' },
					{ date: '2026-11-30', answer: 'yes' }
				],
				true
			]
		]);
	});

	it('emits nothing when every reachable day already has that answer', () => {
		const { wrapper, sheet } = mountSection(
			makeMyDays({ '2026-11-16': 'yes', '2026-11-23': 'yes', '2026-11-30': 'yes' })
		);
		sheet.vm.$emit('fill', MON, 'yes', true);
		expect(wrapper.emitted('change')).toBeUndefined();
	});
});
