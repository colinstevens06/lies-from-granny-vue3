import { afterEach, describe, expect, it } from 'vitest';
import { mountWithPrime } from '../../../test-utils/mount';
import ShowNightsSheet from './show-nights-sheet.vue';

const summary = { total: 4, playable: ['2026-11-20'], practiceOnly: ['2026-11-21'] };

afterEach(() => {
	document.body.innerHTML = '';
});

// PrimeVue's Sidebar teleports to document.body, so the sheet's text and buttons are found there.
const mountSheet = async () => {
	const wrapper = mountWithPrime(ShowNightsSheet, { props: { visible: true, summary } });
	await new Promise(resolve => setTimeout(resolve, 0)); // Sidebar renders its content a tick after mounting.
	return wrapper;
};
const buttonWith = (label: string) => [...document.body.querySelectorAll('button')].find(b => b.textContent === label);

describe('show-nights-sheet', () => {
	it('lists the show-Yes and practice-only nights', async () => {
		await mountSheet();
		expect(document.body.textContent).toContain('You can play a show on 1 of 4 Friday and Saturday nights.');
		expect(document.body.textContent).toContain('Fri, Nov 20');
		expect(document.body.textContent).toContain('Practice only, no show (1)');
		expect(document.body.textContent).toContain('Sat, Nov 21');
	});

	it('confirms from "Looks right, sign off" and closes from "Go back" without confirming', async () => {
		const wrapper = await mountSheet();
		buttonWith('Go back')!.click();
		expect(wrapper.emitted('update:visible')).toEqual([[false]]);
		expect(wrapper.emitted('confirm')).toBeUndefined();

		buttonWith('Looks right, sign off')!.click();
		expect(wrapper.emitted('confirm')).toHaveLength(1);
	});
});
