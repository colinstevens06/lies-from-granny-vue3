import { describe, expect, it } from 'vitest';
import { mountWithPrime } from '../../../test-utils/mount';
import AnswerCell from './answer-cell.vue';

const FRIDAY = '2026-11-20';
const TUESDAY = '2026-11-17';

const mountCell = (props: { date: string; answer?: 'yes' | 'no' | 'maybe'; showAnswer?: 'no' }) =>
	mountWithPrime(AnswerCell, { props });

describe('answer-cell', () => {
	it('emits the next stop in the Friday cycle, including "Yes, no show"', async () => {
		const wrapper = mountCell({ date: FRIDAY, answer: 'yes' });
		await wrapper.get('button').trigger('click');
		expect(wrapper.emitted('change')).toEqual([[{ date: FRIDAY, answer: 'yes', showAnswer: 'no' }]]);
	});

	it('moves from "no show" to No', async () => {
		const wrapper = mountCell({ date: FRIDAY, answer: 'yes', showAnswer: 'no' });
		await wrapper.get('button').trigger('click');
		expect(wrapper.emitted('change')).toEqual([[{ date: FRIDAY, answer: 'no' }]]);
	});

	it('skips the "no show" stop on a Tuesday', async () => {
		const wrapper = mountCell({ date: TUESDAY, answer: 'yes' });
		await wrapper.get('button').trigger('click');
		expect(wrapper.emitted('change')).toEqual([[{ date: TUESDAY, answer: 'no' }]]);
	});

	it('shows a "no show" band and says so, on a green cell', () => {
		const wrapper = mountCell({ date: FRIDAY, answer: 'yes', showAnswer: 'no' });
		expect(wrapper.text()).toContain('no show');
		expect(wrapper.get('button').classes()).toContain('answer-cell--yes');
		expect(wrapper.get('button').attributes('aria-label')).toContain('Yes, no show');
		expect(mountCell({ date: FRIDAY, answer: 'yes' }).text()).not.toContain('no show');
	});
});
