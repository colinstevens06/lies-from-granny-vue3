import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeBandAvailability, makeForm } from '../../../test-utils/factories';
import { mountWithPrime } from '../../../test-utils/mount';
import { useBandStore } from '@/stores/band';
import PickDates from './pick-dates.vue';

// Far in the future so the real clock never puts these days in the past.
const DAYS = ['2099-03-02', '2099-03-03'];
const form = makeForm({ availability: { startDay: '2099-03-01', endDay: '2099-03-31', practicesNeeded: 2 } });

afterEach(() => {
	document.body.innerHTML = '';
});

describe('pick-dates', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	// Code review #2 (planning/2026-11-da-band-code-review.md): a picked day that stops being offered (a member flips to
	// No) left the chips but stayed in `picked`, so Lock in still counted and posted it.
	it('counts and sends only the picked days that are still offered (code review #2)', async () => {
		const store = useBandStore();
		store.availability = makeBandAvailability(DAYS);
		const lockIn = vi.spyOn(store, 'lockInForm').mockResolvedValue();
		vi.spyOn(store, 'load').mockResolvedValue();

		const wrapper = mountWithPrime(PickDates, { props: { form } });
		for (const option of wrapper.findAll('[role="checkbox"]')) await option.trigger('click');
		expect(wrapper.text()).toContain('Lock in 2');

		// Two members now say No for the 3rd, so it's neither "everyone" nor "one short".
		store.availability = makeBandAvailability(DAYS, 'yes', {
			anna: { '2099-03-03': 'no' },
			kyle: { '2099-03-03': 'no' }
		});
		await wrapper.vm.$nextTick();
		expect(wrapper.text()).toContain('Lock in 1');

		await wrapper
			.findAll('button')
			.find(button => button.text().startsWith('Lock in'))!
			.trigger('click');
		expect(lockIn).toHaveBeenCalledWith(form.id, ['2099-03-02']);
	});
});
