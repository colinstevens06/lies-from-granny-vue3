import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useSaveLane } from '@/composables/use-save-lane';
import type { Answer, MemberAvailability } from '@models/availability';
import type { CurrentMember } from '@models/band-member';
import type { Form } from '@models/form';
import type { Practice } from '@models/practice';

/** Availability writes go out in chunks of at most this many days. */
const CHUNK = 400;
const NOTICE_RETRYING = 'Not saved yet. Retrying…';
const NOTICE_RELOADED = "Couldn't save that. Your answers were reloaded.";

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * The only client holder of server data. nav.vue imports this store, so `band-api` and other API code are imported
 * inside actions, never at the top.
 */
export const useBandStore = defineStore('band', () => {
	const me = ref<CurrentMember>();
	const availability = ref<MemberAvailability[]>([]);
	const forms = ref<Form[]>([]);
	const practices = ref<Practice[]>([]);
	const loadState = ref<LoadState>('idle');
	/** Partly filled follow-up rows, keyed by form id. They live only on this device; `load()` never touches them. */
	const drafts = ref<Record<number, unknown>>({});
	const reloadedNotice = ref(false);

	/** Goes up on every successful save. A load only applies "mine" if it hasn't changed since the load began. */
	let saveVersion = 0;

	const bandApi = async <T>(path: string, options?: { method?: 'POST' | 'PUT' | 'PATCH'; body?: unknown }) =>
		(await import('@utils/band-api')).bandApi<T>(path, options);

	const mineRow = () => availability.value.find(row => row.member === me.value?.member);

	// ── Save lanes ──────────────────────────────────────────────────────────

	/** Applies my queued (not yet confirmed) answers on top of the row the server just sent. */
	const reapplyPendingAnswers = () => {
		const row = mineRow();
		if (!row || !me.value) return;

		for (const date of answerLane.pendingKeys()) {
			row.days[date] = {
				answer: answerLane.pendingValue(date)!,
				source: 'self',
				updatedBy: me.value.member,
				updatedAt: new Date().toISOString()
			};
		}
	};

	const answerLane = useSaveLane<Answer, MemberAvailability>({
		delayMs: 400,
		async send(entries) {
			let result!: { availability: MemberAvailability };
			for (let i = 0; i < entries.length; i += CHUNK) {
				result = await bandApi(`availability/${me.value!.member}`, {
					method: 'PATCH',
					body: { changes: entries.slice(i, i + CHUNK).map(([date, answer]) => ({ date, answer })) }
				});
			}
			return result.availability;
		},
		onSaved(_entries, row) {
			saveVersion++;
			reloadedNotice.value = false;
			availability.value = availability.value.map(r => (r.member === row.member ? row : r));
			reapplyPendingAnswers();
		},
		onRejected() {
			reloadedNotice.value = true;
			void load();
		}
	});

	const formLane = useSaveLane<unknown, Form>({
		delayMs: 600,
		async send(entries) {
			// Latest whole body per form wins; one request per form.
			let result!: { form: Form };
			for (const [formId, body] of entries) result = await bandApi(`forms/${formId}/answers`, { method: 'PUT', body });
			return result.form;
		},
		onSaved(_entries, form) {
			saveVersion++;
			reloadedNotice.value = false;
			forms.value = forms.value.map(f => (f.id === form.id ? form : f));
		},
		onRejected() {
			reloadedNotice.value = true;
			void load();
		}
	});

	/** Queues my answers (keyed by date). `immediate` is for a weekday fill. */
	const setMyAnswers = (changes: { date: string; answer: Answer }[], { immediate = false } = {}) => {
		const row = mineRow();
		if (!row || !me.value) return;

		for (const { date, answer } of changes) {
			row.days[date] = { answer, source: 'self', updatedBy: me.value.member, updatedAt: new Date().toISOString() };
			answerLane.enqueue(date, answer, { immediate });
		}
	};

	/** Queues my answers to one form. The latest whole body wins. */
	const setMyFormAnswer = (formId: number, body: unknown) => formLane.enqueue(String(formId), body);

	/** The body still waiting to save for a form, so its screen can keep showing what the member typed. */
	const pendingFormAnswer = (formId: number) => formLane.pendingValue(String(formId));

	const saving = computed(() => answerLane.busy.value || formLane.busy.value);
	const saveNotice = computed(() =>
		answerLane.failing.value || formLane.failing.value
			? NOTICE_RETRYING
			: reloadedNotice.value
			? NOTICE_RELOADED
			: undefined
	);

	const setDraft = (formId: number, value: unknown) => (drafts.value[formId] = value);
	const clearDraft = (formId: number) => delete drafts.value[formId];

	if (typeof window !== 'undefined') {
		window.addEventListener('beforeunload', event => {
			if (saving.value || Object.keys(drafts.value).length > 0) {
				event.preventDefault();
				event.returnValue = '';
			}
		});
	}

	// ── Loading ─────────────────────────────────────────────────────────────

	/**
	 * Fetches availability, forms and practices in parallel. Merge rule: my availability and my form answers apply only
	 * if no save finished since the load began, and answers still pending keep their local value. Everything else applies.
	 */
	async function load() {
		const startedAt = saveVersion;
		if (loadState.value !== 'ready') loadState.value = 'loading';

		try {
			const [avail, formList, practiceList] = await Promise.all([
				bandApi<{ members: MemberAvailability[] }>('availability'),
				bandApi<{ forms: Form[] }>('forms'),
				bandApi<{ practices: Practice[] }>('practices')
			]);
			const mineChanged = saveVersion !== startedAt;
			const mine = mineRow();

			availability.value = avail.members.map(row =>
				row.member === me.value?.member && (mineChanged || answerLane.busy.value) && mine ? mine : row
			);
			reapplyPendingAnswers();

			forms.value = formList.forms.map(form =>
				(mineChanged || formLane.pendingValue(String(form.id)) !== undefined) && forms.value.some(f => f.id === form.id)
					? forms.value.find(f => f.id === form.id)!
					: form
			);
			practices.value = practiceList.practices;
			loadState.value = 'ready';
		} catch {
			// A 401 already went to login. Anything else keeps what's on screen and shows the error state.
			loadState.value = loadState.value === 'ready' ? 'ready' : 'error';
		}
	}

	// ── Getters ─────────────────────────────────────────────────────────────

	/** My own availability, keyed by day. */
	const myDays = computed(() => mineRow()?.days ?? {});
	const openForms = computed(() => forms.value.filter(form => !form.closedAt));
	const availabilityForm = computed(() => openForms.value.find(form => form.availability));
	const myTodos = computed(() =>
		openForms.value.filter(form => !form.members.find(m => m.member === me.value?.member)?.signedOffAt)
	);
	const everyoneIn = (form: Form) => form.members.every(m => m.signedOffAt);

	/** Signs me off a form. Throws a `BandApiError`: 409 `incomplete` (with what's missing) or `closed`. */
	const signOffForm = async (formId: number) => {
		const { form } = await bandApi<{ form: Form }>(`forms/${formId}/sign-off`, { method: 'POST' });
		forms.value = forms.value.map(f => (f.id === form.id ? form : f));
	};

	/** Admin: books the days as scheduled practices and closes the form. Throws a `BandApiError` (409 `already-booked` names the days). */
	const lockInForm = async (formId: number, days: string[]) => {
		await bandApi(`forms/${formId}/lock-in`, { method: 'POST', body: { days } });
	};

	/** Admin: closes an open form (the server refuses anyone else). */
	const closeForm = async (formId: number) => {
		const { form } = await bandApi<{ form: Form }>(`forms/${formId}/close`, { method: 'POST' });
		forms.value = forms.value.map(f => (f.id === form.id ? form : f));
	};

	// ── Identity ────────────────────────────────────────────────────────────

	/** Loads who's signed in once. `signed-out` is a 401, `not-a-member` a 403. */
	const loadMe = async (): Promise<'ok' | 'signed-out' | 'not-a-member'> => {
		if (me.value) return 'ok';

		const { bandApi: request, BandApiError } = await import('@utils/band-api');
		try {
			me.value = await request<CurrentMember>('me', { redirectOn401: false });
			return 'ok';
		} catch (error) {
			if (error instanceof BandApiError && error.status === 401) return 'signed-out';
			if (error instanceof BandApiError && error.status === 403) return 'not-a-member';
			throw error;
		}
	};

	const signOut = async () => {
		const { signOut: leave } = await import('@utils/auth');
		await leave();
		me.value = undefined;
	};

	return {
		me,
		availability,
		forms,
		practices,
		loadState,
		saving,
		saveNotice,
		drafts,
		myDays,
		openForms,
		availabilityForm,
		myTodos,
		everyoneIn,
		load,
		loadMe,
		signOut,
		closeForm,
		lockInForm,
		signOffForm,
		setMyAnswers,
		setMyFormAnswer,
		pendingFormAnswer,
		setDraft,
		clearDraft
	};
});
