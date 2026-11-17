import { computed } from 'vue';
import type { MyAnswer } from '@models/availability';
import type { Form } from '@models/form';
import { clientFormFor } from '@/forms';
import { ruleFor } from '@/forms/rules';
import { useEasternNow } from '@/composables/use-eastern-now';
import { useAvailabilityStore } from '@/stores/availability';
import { useFormStore } from '@/stores/forms';
import { useMemberStore } from '@/stores/member';

/**
 * Where the signed-in member stands on a form: the shared sign-off rule's verdict (the same `mineOf` and `missing`
 * the server runs) plus the registry's lines for it. Also the form screens' way to answer, since a screen writes both
 * availability and form answers and a component uses one store at most. Used by the to-do card, the form page and
 * each form's `screen.vue`.
 */
export const useFormProgress = (form: () => Form) => {
	const memberStore = useMemberStore();
	const availabilityStore = useAvailabilityStore();
	const formStore = useFormStore();
	const { today } = useEasternNow();

	const myDays = computed(() => availabilityStore.myDays);
	const mine = computed(() =>
		memberStore.me ? ruleFor(form().slug)?.mineOf(form(), memberStore.me.member) : undefined
	);
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

	/** Queues my availability answers. `immediate` is for a weekday fill. */
	const setMyAnswers = (changes: MyAnswer[], options?: { immediate?: boolean }) =>
		availabilityStore.setMyAnswers(changes, options);

	/** Queues my whole answer body for this form. */
	const setMyFormAnswer = (body: object) => formStore.setMyFormAnswer(form().id, body);

	/** This form's body still waiting to save, so the screen keeps showing what the member typed. */
	const pendingFormAnswer = () => formStore.pendingFormAnswer(form().id);

	return { today, myDays, mine, missing, done, lines, setMyAnswers, setMyFormAnswer, pendingFormAnswer };
};
