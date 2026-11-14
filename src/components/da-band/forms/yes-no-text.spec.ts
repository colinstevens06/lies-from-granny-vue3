import { describe, expect, it } from 'vitest';
import { mountWithPrime } from '../../../test-utils/mount';
import YesNoText from './yes-no-text.vue';

const props = { prompt: 'Any new song?', label: 'Song – Artist', maxLength: 160 };
const choose = async (wrapper: ReturnType<typeof mountWithPrime>, label: 'Yes' | 'No') => {
	const option = wrapper.findAll('[role="radio"]').find(el => el.text() === label);
	await option!.trigger('click');
};

describe('yes-no-text', () => {
	it('No hides the text input', () => {
		const wrapper = mountWithPrime(YesNoText, { props: { ...props, wants: false } });
		expect(wrapper.find('input[type="text"], input.p-inputtext').exists()).toBe(false);
	});

	it('Yes with empty text says how to save or skip, and emits nothing', async () => {
		const wrapper = mountWithPrime(YesNoText, { props });
		await choose(wrapper, 'Yes');
		expect(wrapper.find('input.p-inputtext').exists()).toBe(true);
		expect(wrapper.text()).toContain('Type the song to save it, or choose No.');
		expect(wrapper.text()).not.toContain('required');
		expect(wrapper.emitted('change')).toBeUndefined();
	});

	it('Yes with text emits the trimmed answer and drops the message', async () => {
		const wrapper = mountWithPrime(YesNoText, { props });
		await choose(wrapper, 'Yes');
		await wrapper.find('input.p-inputtext').setValue('  Song – Artist ');
		expect(wrapper.text()).not.toContain('Type the song');
		expect(wrapper.emitted('change')).toEqual([[{ wants: true, text: 'Song – Artist' }]]);
	});

	// Code review #7: the local choice and text were set once from the props, so a reload (after a refused save, say)
	// left the control showing stale values.
	it('follows the saved answer when the props change (code review #7)', async () => {
		const wrapper = mountWithPrime(YesNoText, { props: { ...props, wants: true, text: 'Old song' } });
		expect((wrapper.find('input.p-inputtext').element as HTMLInputElement).value).toBe('Old song');

		await wrapper.setProps({ text: 'New song' });
		expect((wrapper.find('input.p-inputtext').element as HTMLInputElement).value).toBe('New song');

		await wrapper.setProps({ wants: false, text: undefined });
		expect(wrapper.find('input.p-inputtext').exists()).toBe(false);
	});

	it('keeps what the member is typing when the same answer comes back trimmed', async () => {
		const wrapper = mountWithPrime(YesNoText, { props: { ...props, wants: true, text: 'Song' } });
		await wrapper.find('input.p-inputtext').setValue('Song ');
		await wrapper.setProps({ text: 'Song' });
		expect((wrapper.find('input.p-inputtext').element as HTMLInputElement).value).toBe('Song ');
	});
});
