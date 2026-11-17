import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useSaveLane } from '@/composables/use-save-lane';
import { bandService } from '@/services/band-service';
import type { DayAnswer, MemberAvailability, MyAnswer } from '@models/availability';
import type { CurrentMember } from '@models/band-member';
import type { LoadState } from '@models/load-state';
import type { SaveProblem } from '@models/save-lane';
import { useMemberStore } from './member';
import { warnBeforeUnloadWhile } from './unload-guard';

/** Availability writes go out in chunks of at most this many days. */
const CHUNK = 400;

/** Everyone's availability, plus my answers' save queue. */
export const useAvailabilityStore = defineStore('availability', () => {
	const memberStore = useMemberStore();

	/** Everyone's answers, one row per member. */
	const byMember = ref<MemberAvailability[]>([]);
	const loadState = ref<LoadState>('idle');
	const saveWasRefused = ref(false);

	/** Goes up on every successful availability save. A load only applies "mine" if it hasn't changed since the load began. */
	let saveVersion = 0;

	const mineRow = () => byMember.value.find(row => row.member === memberStore.me?.member);

	/** Applies my queued (not yet confirmed) answers on top of the row the server just sent. */
	const dayFor = ({ answer, showAnswer }: Omit<MyAnswer, 'date'>, id: CurrentMember['member']): DayAnswer => ({
		answer,
		...(showAnswer && { showAnswer }),
		source: 'self',
		updatedBy: id,
		updatedAt: new Date().toISOString()
	});

	const reapplyPendingAnswers = () => {
		const row = mineRow();
		if (!row || !memberStore.me) return;

		for (const date of answerLane.pendingKeys()) {
			row.days[date] = dayFor(answerLane.pendingValue(date)!, memberStore.me.member);
		}
	};

	const answerLane = useSaveLane<Omit<MyAnswer, 'date'>, MemberAvailability>({
		delayMs: 400,
		async send(entries) {
			let row!: MemberAvailability;
			for (let i = 0; i < entries.length; i += CHUNK) {
				row = await bandService.patchAvailability(
					memberStore.me!.member,
					entries.slice(i, i + CHUNK).map(([date, change]) => ({ date, ...change }))
				);
			}
			return row;
		},
		onSaved(_entries, row) {
			saveVersion++;
			saveWasRefused.value = false;
			byMember.value = byMember.value.map(r => (r.member === row.member ? row : r));
			reapplyPendingAnswers();
		},
		onRejected(entries) {
			// The refused answers were applied optimistically. Drop them (unless a newer tap for that day is queued) so
			// they can't outlive the reload while the lane is still busy.
			const row = mineRow();
			for (const [date] of entries) if (row && answerLane.pendingValue(date) === undefined) delete row.days[date];
			saveWasRefused.value = true;
			void load();
		}
	});

	/** Queues my answers (keyed by date). Each replaces its whole day. `immediate` is for a weekday fill. */
	const setMyAnswers = (changes: MyAnswer[], { immediate = false } = {}) => {
		const row = mineRow();
		if (!row || !memberStore.me) return;

		for (const { date, ...change } of changes) {
			row.days[date] = dayFor(change, memberStore.me.member);
			answerLane.enqueue(date, change, { immediate });
		}
	};

	const saving = computed(() => answerLane.busy.value);
	const saveProblem = computed((): SaveProblem | undefined =>
		answerLane.failing.value ? 'retrying' : saveWasRefused.value ? 'reloaded' : undefined
	);
	warnBeforeUnloadWhile(() => saving.value);

	/**
	 * Merge rule: my row applies from the server only if no availability save finished since the load began, and
	 * answers still pending are laid back over it. Everyone else's rows always apply.
	 */
	const load = async () => {
		const startedAt = saveVersion;
		if (loadState.value !== 'ready') loadState.value = 'loading';

		try {
			const rows = await bandService.getAvailability();
			const mineChanged = saveVersion !== startedAt;
			const mine = mineRow();

			byMember.value = rows.map(row => (row.member === memberStore.me?.member && mineChanged && mine ? mine : row));
			reapplyPendingAnswers();
			loadState.value = 'ready';
		} catch {
			// A 401 already went to login. Anything else keeps what's on screen and shows the error state.
			if (loadState.value !== 'ready') loadState.value = 'error';
		}
	};

	/** My own availability, keyed by day. */
	const myDays = computed(() => mineRow()?.days ?? {});

	return { byMember, loadState, saving, saveProblem, myDays, load, setMyAnswers };
});
