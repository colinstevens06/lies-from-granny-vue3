import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useSaveLane } from '@/composables/use-save-lane';
import { bandService } from '@/services/band-service';
import type { Form } from '@models/form';
import type { LoadState } from '@models/load-state';
import type { SaveProblem } from '@models/save-lane';
import { useMemberStore } from './member';
import { warnBeforeUnloadWhile } from './unload-guard';

/** Every band form, plus the save queue for my answers to them. */
export const useFormStore = defineStore('forms', () => {
	const memberStore = useMemberStore();

	const forms = ref<Form[]>([]);
	const loadState = ref<LoadState>('idle');
	const saveWasRefused = ref(false);

	/** Forms whose answers saved since the current load began: that load's copy of them may predate the save. */
	const formsSavedDuringLoad = new Set<number>();

	const formLane = useSaveLane<object, Form[]>({
		delayMs: 600,
		async send(entries) {
			// Latest whole body per form wins; one request per form, and every form's server copy is kept.
			const saved: Form[] = [];
			for (const [formId, body] of entries) {
				saved.push(await bandService.putFormMemberAnswers(Number(formId), memberStore.me!.member, body));
			}
			return saved;
		},
		onSaved(_entries, savedForms) {
			saveWasRefused.value = false;
			for (const saved of savedForms) formsSavedDuringLoad.add(saved.id);
			forms.value = forms.value.map(f => savedForms.find(saved => saved.id === f.id) ?? f);
		},
		onRejected() {
			saveWasRefused.value = true;
			void load();
		}
	});

	/** Queues my answers to one form. The latest whole body wins. */
	const setMyFormAnswer = (formId: number, body: object) => formLane.enqueue(String(formId), body);

	/** The body still waiting to save for a form, so its screen can keep showing what the member typed. */
	const pendingFormAnswer = (formId: number) => formLane.pendingValue(String(formId));

	const saving = computed(() => formLane.busy.value);
	const saveProblem = computed((): SaveProblem | undefined =>
		formLane.failing.value ? 'retrying' : saveWasRefused.value ? 'reloaded' : undefined
	);
	warnBeforeUnloadWhile(() => saving.value);

	/** Merge rule: a form keeps its local copy only while its answers are pending or saved since the load began. */
	const load = async () => {
		formsSavedDuringLoad.clear();
		if (loadState.value !== 'ready') loadState.value = 'loading';

		try {
			const formList = await bandService.getForms();
			forms.value = formList.map(form =>
				formLane.pendingValue(String(form.id)) !== undefined || formsSavedDuringLoad.has(form.id)
					? forms.value.find(f => f.id === form.id) ?? form
					: form
			);
			loadState.value = 'ready';
		} catch {
			// A 401 already went to login. Anything else keeps what's on screen and shows the error state.
			if (loadState.value !== 'ready') loadState.value = 'error';
		}
	};

	const openForms = computed(() => forms.value.filter(form => !form.closedAt));
	const availabilityForm = computed(() => openForms.value.find(form => form.availability));
	/** Open forms I haven't signed off. */
	const myTodos = computed(() =>
		openForms.value.filter(form => !form.members.find(m => m.member === memberStore.me?.member)?.signedOffAt)
	);

	const replaceForm = (form: Form) => (forms.value = forms.value.map(f => (f.id === form.id ? form : f)));

	/** Signs me off a form. Throws an `ApiError`: 409 `incomplete` (with what's missing) or `closed`. */
	const signOffForm = async (formId: number) => {
		replaceForm(await bandService.patchFormMember(formId, memberStore.me!.member, { signedOff: true }));
	};

	/** Admin: closes an open form (the server refuses anyone else). */
	const closeForm = async (formId: number) => {
		replaceForm(await bandService.patchForm(formId, { closed: true }));
	};

	/**
	 * Admin: books the days as scheduled practices and closes the form. The service call only: practices change too, so
	 * `useBandData().lockIn` calls this and reloads both. Throws an `ApiError` (409 `already-booked` names the days).
	 */
	const lockInForm = async (formId: number, days: string[]) => {
		await bandService.putFormSchedule(formId, days);
	};

	return {
		forms,
		loadState,
		saving,
		saveProblem,
		openForms,
		availabilityForm,
		myTodos,
		load,
		setMyFormAnswer,
		pendingFormAnswer,
		signOffForm,
		closeForm,
		lockInForm
	};
});
