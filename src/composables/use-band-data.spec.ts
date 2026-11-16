import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { makeAvailability } from '../test-utils/factories';
import { serve, wait } from '../test-utils/serve';
import { useAvailabilityStore } from '@/stores/availability';
import { useFormStore } from '@/stores/forms';
import { useMemberStore } from '@/stores/member';
import { usePracticeStore } from '@/stores/practices';
import { useBandData } from './use-band-data';

const runBandData = () => {
	const scope = effectScope();
	const data = scope.run(() => useBandData())!;
	return { data, stop: () => scope.stop() };
};

describe('useBandData', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('shows the error when any one of the three loads fails', async () => {
		serve(path => (path === 'forms' ? { status: 500, body: { error: 'down' } } : { body: [] }));
		const { data, stop } = runBandData();

		await data.load();

		expect(data.loadState.value).toBe('error');
		stop();
	});

	it('is ready only once all three loads succeed', async () => {
		serve(() => ({ body: [] }));
		const { data, stop } = runBandData();
		expect(data.loadState.value).toBe('loading');

		await data.load();

		expect(data.loadState.value).toBe('ready');
		stop();
	});

	it('counts as saving while only an availability answer is waiting to save', async () => {
		serve(() => ({ body: makeAvailability('colin', { '2026-12-01': 'yes' }) }));
		useMemberStore().me = { member: 'colin' } as never;
		useAvailabilityStore().byMember = [makeAvailability('colin', {})];
		const { data, stop } = runBandData();

		useAvailabilityStore().setMyAnswers([{ date: '2026-12-01', answer: 'yes' }]);

		expect(data.saving.value).toBe(true);
		await vi.waitFor(() => expect(data.saving.value).toBe(false));
		await wait(0);
		stop();
	});

	it('reloads forms and practices after a lock-in', async () => {
		const formStore = useFormStore();
		const lockInForm = vi.spyOn(formStore, 'lockInForm').mockResolvedValue();
		const formsLoad = vi.spyOn(formStore, 'load').mockResolvedValue();
		const practicesLoad = vi.spyOn(usePracticeStore(), 'load').mockResolvedValue();
		const availabilityLoad = vi.spyOn(useAvailabilityStore(), 'load').mockResolvedValue();
		const { data, stop } = runBandData();

		await data.lockIn(7, ['2099-03-02']);

		expect(lockInForm).toHaveBeenCalledWith(7, ['2099-03-02']);
		expect(formsLoad).toHaveBeenCalledOnce();
		expect(practicesLoad).toHaveBeenCalledOnce();
		expect(lockInForm.mock.invocationCallOrder[0]).toBeLessThan(formsLoad.mock.invocationCallOrder[0]);
		expect(availabilityLoad).not.toHaveBeenCalled();
		stop();
	});

	it('reloads nothing when the lock-in is refused, and passes the error on', async () => {
		const formStore = useFormStore();
		vi.spyOn(formStore, 'lockInForm').mockRejectedValue(new Error('already-booked'));
		const formsLoad = vi.spyOn(formStore, 'load').mockResolvedValue();
		const practicesLoad = vi.spyOn(usePracticeStore(), 'load').mockResolvedValue();
		const { data, stop } = runBandData();

		await expect(data.lockIn(7, ['2099-03-02'])).rejects.toThrow('already-booked');

		expect(formsLoad).not.toHaveBeenCalled();
		expect(practicesLoad).not.toHaveBeenCalled();
		stop();
	});
});
