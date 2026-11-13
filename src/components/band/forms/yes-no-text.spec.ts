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

	it('Yes with empty text shows the required message and emits nothing', async () => {
		const wrapper = mountWithPrime(YesNoText, { props });
		await choose(wrapper, 'Yes');
		expect(wrapper.find('input.p-inputtext').exists()).toBe(true);
		expect(wrapper.text()).toContain('Song is required when Yes is selected.');
		expect(wrapper.emitted('change')).toBeUndefined();
	});

	it('Yes with text emits the trimmed answer and drops the message', async () => {
		const wrapper = mountWithPrime(YesNoText, { props });
		await choose(wrapper, 'Yes');
		await wrapper.find('input.p-inputtext').setValue('  Song – Artist ');
		expect(wrapper.text()).not.toContain('Song is required');
		expect(wrapper.emitted('change')).toEqual([[{ wants: true, text: 'Song – Artist' }]]);
	});
});
