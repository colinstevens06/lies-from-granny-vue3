import { computed } from 'vue';
import type { Form } from '@models/form';
import { clientFormFor } from '@/forms';
import { ruleFor } from '@/forms/rules';
import { useEasternNow } from '@/composables/use-eastern-now';
import { useBandStore } from '@/stores/band';

/**
 * Where the signed-in member stands on a form: the shared sign-off rule's verdict (the same `mineOf` and `missing`
 * the server runs) plus the registry's lines for it. Used by the to-do card and the form page.
 */
export const useFormProgress = (form: () => Form) => {
	const band = useBandStore();
	const { today } = useEasternNow();

	const myDays = computed(() => band.myDays);
	const mine = computed(() => (band.me ? ruleFor(form().slug)?.mineOf(form(), band.me.member) : undefined));
	const missing = computed(() => ruleFor(form().slug)?.missing(form(), myDays.value, mine.value, today.value));
	const done = computed(() => missing.value?.done === true);
	const lines = computed(() =>
		missing.value
			? clientFormFor(form().slug)?.todoLines(form(), mine.value, {
					myDays: myDays.value,
					today: today.value,
					missing: missing.value
			  }) ?? []
			: []
	);

	return { today, myDays, mine, missing, done, lines };
};
