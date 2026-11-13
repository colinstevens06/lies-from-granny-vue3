import { afterEach, describe, expect, it } from 'vitest';
import { mountWithPrime } from '../../../test-utils/mount';
import WeekdayFillSheet from './weekday-fill-sheet.vue';

// Sidebar teleports into document.body, so these tests query `document` rather than the wrapper.
const props = { visible: true, blankCounts: [1, 2, 3, 4, 5, 6, 7], dayCounts: [2, 3, 4, 5, 6, 7, 8] };
const row = (weekday: number) => document.body.querySelectorAll('.p-selectbutton')[weekday] as HTMLElement;
const tap = async (weekday: number, label: string) => {
	const option = [...row(weekday).querySelectorAll<HTMLElement>('[role="radio"]')].find(
		el => el.textContent?.trim() === label
	);
	option!.click();
	await Promise.resolve();
};
// Sidebar renders its content a tick after mounting.
const openSheet = async (extra: Record<string, unknown> = {}) => {
	const wrapper = mountWithPrime(WeekdayFillSheet, { props: { ...props, ...extra } });
	await new Promise(resolve => setTimeout(resolve, 0));
	return wrapper;
};
const switchInput = () => document.body.querySelector<HTMLInputElement>('#weekday-fill-overwrite')!;

afterEach(() => {
	document.body.innerHTML = '';
});

describe('weekday-fill-sheet', () => {
	it('emits a blanks-only fill by default, and shows what it did', async () => {
		const wrapper = await openSheet();
		await tap(1, 'Yes');
		expect(wrapper.emitted('fill')).toEqual([[1, 'yes', false]]);
		expect(document.body.textContent).toContain('2 days filled ✓');
	});

	it('does not emit when nothing is blank for that weekday', async () => {
		const wrapper = await openSheet({ blankCounts: [0, 0, 0, 0, 0, 0, 0] });
		await tap(2, 'No');
		expect(wrapper.emitted('fill')).toBeUndefined();
		expect(document.body.textContent).toContain('Nothing left to fill');
	});

	it('the overwrite switch turns the fill into an overwrite, and resets when the sheet reopens', async () => {
		const wrapper = await openSheet();
		switchInput().click();
		await wrapper.vm.$nextTick();
		await tap(3, 'Not sure');
		expect(wrapper.emitted('fill')).toEqual([[3, 'maybe', true]]);

		await wrapper.setProps({ visible: false });
		await wrapper.setProps({ visible: true });
		expect(switchInput().checked).toBe(false);
		expect(document.body.textContent).not.toContain('days filled ✓');
	});

	// Code review #3 (planning/2026-11-da-band-code-review.md): a selected SelectButton option swallows a re-tap on
	// newer PrimeVue 3 releases (3.53.1), so the sheet must never mark an answer as selected. The last tap is shown in
	// the status text only.
	it('never marks a tapped answer as selected, so a re-tap always emits (code review #3)', async () => {
		const wrapper = await openSheet();
		await tap(1, 'Yes');
		expect(row(1).querySelector('[aria-checked="true"]')).toBeNull();

		switchInput().click();
		await wrapper.vm.$nextTick();
		await tap(1, 'Yes');
		expect(wrapper.emitted('fill')).toHaveLength(2);
	});
});
