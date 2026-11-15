import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useSaveLane } from '@/composables/use-save-lane';
import { BandApiError } from '@models/band-api-error';
import type { DayAnswer, MemberAvailability, MyAnswer } from '@models/availability';
import type { CurrentMember } from '@models/band-member';
import type { Form } from '@models/form';
import type { LoadState } from '@models/load-state';
import type { Practice, PracticeInput } from '@models/practice';

/** Availability writes go out in chunks of at most this many days. */
const CHUNK = 400;
const NOTICE_RETRYING = 'Not saved yet. Retrying…';
const NOTICE_RELOADED = "Couldn't save that. Your answers were reloaded.";

/**
 * The only client holder of server data. nav.vue imports this store, so the band service and other API code are
 * imported inside actions, never at the top.
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

	const service = async () => (await import('@/services/band-service')).bandService;

	const mineRow = () => availability.value.find(row => row.member === me.value?.member);

	// ── Save lanes ──────────────────────────────────────────────────────────

	/** Applies my queued (not yet confirmed) answers on top of the row the server just sent. */
	const dayFor = ({ answer, showAnswer }: Omit<MyAnswer, 'date'>, member: CurrentMember['member']): DayAnswer => ({
		answer,
		...(showAnswer && { showAnswer }),
		source: 'self',
		updatedBy: member,
		updatedAt: new Date().toISOString()
	});

	const reapplyPendingAnswers = () => {
		const row = mineRow();
		if (!row || !me.value) return;

		for (const date of answerLane.pendingKeys()) {
			row.days[date] = dayFor(answerLane.pendingValue(date)!, me.value.member);
		}
	};

	const answerLane = useSaveLane<Omit<MyAnswer, 'date'>, MemberAvailability>({
		delayMs: 400,
		async send(entries) {
			const { saveAvailability } = await service();
			let result!: { availability: MemberAvailability };
			for (let i = 0; i < entries.length; i += CHUNK) {
				result = await saveAvailability(
					me.value!.member,
					entries.slice(i, i + CHUNK).map(([date, change]) => ({ date, ...change }))
				);
			}
			return result.availability;
		},
		onSaved(_entries, row) {
			saveVersion++;
			reloadedNotice.value = false;
			availability.value = availability.value.map(r => (r.member === row.member ? row : r));
			reapplyPendingAnswers();
		},
		onRejected(entries) {
			// The refused answers were applied optimistically. Drop them (unless a newer tap for that day is queued) so
			// they can't outlive the reload while the lane is still busy.
			const row = mineRow();
			for (const [date] of entries) if (row && answerLane.pendingValue(date) === undefined) delete row.days[date];
			reloadedNotice.value = true;
			void load();
		}
	});

	/** Forms whose answers saved since the current load began: that load's copy of them may predate the save. */
	const formsSavedDuringLoad = new Set<number>();

	const formLane = useSaveLane<unknown, Form[]>({
		delayMs: 600,
		async send(entries) {
			// Latest whole body per form wins; one request per form, and every form's server copy is kept.
			const { saveFormAnswers } = await service();
			const saved: Form[] = [];
			for (const [formId, body] of entries) saved.push((await saveFormAnswers(Number(formId), body)).form);
			return saved;
		},
		onSaved(_entries, savedForms) {
			saveVersion++;
			reloadedNotice.value = false;
			for (const saved of savedForms) formsSavedDuringLoad.add(saved.id);
			forms.value = forms.value.map(f => savedForms.find(saved => saved.id === f.id) ?? f);
		},
		onRejected() {
			reloadedNotice.value = true;
			void load();
		}
	});

	/** Queues my answers (keyed by date). Each replaces its whole day. `immediate` is for a weekday fill. */
	const setMyAnswers = (changes: MyAnswer[], { immediate = false } = {}) => {
		const row = mineRow();
		if (!row || !me.value) return;

		for (const { date, ...change } of changes) {
			row.days[date] = dayFor(change, me.value.member);
			answerLane.enqueue(date, change, { immediate });
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
	 * Fetches availability, forms and practices in parallel. Merge rule: my availability applies only if no save finished
	 * since the load began, and answers still pending are laid back over the server's row. A form keeps its local copy only
	 * while its answers are pending or just saved; every other form takes the server's copy. Everything else applies.
	 */
	async function load() {
		const startedAt = saveVersion;
		formsSavedDuringLoad.clear();
		if (loadState.value !== 'ready') loadState.value = 'loading';

		try {
			const api = await service();
			const [avail, formList, practiceList] = await Promise.all([api.availability(), api.forms(), api.practices()]);
			const mineChanged = saveVersion !== startedAt;
			const mine = mineRow();

			availability.value = avail.members.map(row =>
				row.member === me.value?.member && mineChanged && mine ? mine : row
			);
			reapplyPendingAnswers();

			forms.value = formList.forms.map(form =>
				formLane.pendingValue(String(form.id)) !== undefined || formsSavedDuringLoad.has(form.id)
					? forms.value.find(f => f.id === form.id) ?? form
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

	/** Signs me off a form. Throws a `BandApiError`: 409 `incomplete` (with what's missing) or `closed`. */
	const signOffForm = async (formId: number) => {
		const { form } = await (await service()).signOff(formId);
		forms.value = forms.value.map(f => (f.id === form.id ? form : f));
	};

	/**
	 * Admin: creates a practice (no `id`) or replaces one (whole record), and updates the store. Goes straight through
	 * the service, not the save queue. Throws a `BandApiError` (409 `date-taken`, 400 with the error code).
	 */
	const savePractice = async (input: PracticeInput, id?: number) => {
		const { practice } = await (await service()).savePractice(input, id);
		practices.value =
			id === undefined
				? [...practices.value, practice]
				: practices.value.map(p => (p.id === practice.id ? practice : p));
	};

	/** Admin: books the days as scheduled practices and closes the form. Throws a `BandApiError` (409 `already-booked` names the days). */
	const lockInForm = async (formId: number, days: string[]) => {
		await (await service()).lockIn(formId, days);
	};

	/** Admin: closes an open form (the server refuses anyone else). */
	const closeForm = async (formId: number) => {
		const { form } = await (await service()).closeForm(formId);
		forms.value = forms.value.map(f => (f.id === form.id ? form : f));
	};

	// ── Identity ────────────────────────────────────────────────────────────

	/** Loads who's signed in once. `signed-out` is a 401, `not-a-member` a 403. */
	const loadMe = async (): Promise<'ok' | 'signed-out' | 'not-a-member'> => {
		if (me.value) return 'ok';

		const { bandService } = await import('@/services/band-service');
		try {
			me.value = await bandService.me();
			return 'ok';
		} catch (error) {
			if (error instanceof BandApiError && error.status === 401) return 'signed-out';
			if (error instanceof BandApiError && error.status === 403) return 'not-a-member';
			throw error;
		}
	};

	const signOut = async () => {
		// Local testing: the chosen member is the whole session, and Identity isn't running.
		if (import.meta.env.DEV) {
			const dev = await import('@utils/da-band/auth/dev-auth');
			if (dev.getDevMember()) {
				dev.clearDevMember();
				me.value = undefined;
				return;
			}
		}

		const { signOut: leave } = await import('@utils/da-band/auth/auth');
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
		load,
		loadMe,
		signOut,
		closeForm,
		savePractice,
		lockInForm,
		signOffForm,
		setMyAnswers,
		setMyFormAnswer,
		pendingFormAnswer,
		setDraft,
		clearDraft
	};
});
