<template>
	<form class="practice-editor" @submit.prevent="save">
		<h2>{{ practice ? 'Edit practice' : 'Add a practice' }}</h2>

		<label class="practice-editor__field">
			Date
			<input v-model="date" type="date" class="p-inputtext" />
		</label>

		<div class="practice-editor__times">
			<label class="practice-editor__field">
				Start
				<input v-model="startTime" type="time" class="p-inputtext" />
			</label>
			<label class="practice-editor__field">
				End
				<input v-model="endTime" type="time" class="p-inputtext" />
			</label>
		</div>
		<small class="band-card__meta">Leave both empty for "Time TBD".</small>

		<label class="practice-editor__field">
			Location
			<InputText v-model="location" :placeholder="PRACTICE_HOME" />
		</label>

		<div class="practice-editor__field">
			Status
			<SelectButton
				v-model="status"
				:options="statusOptions"
				option-label="label"
				option-value="value"
				:allow-empty="false"
			/>
		</div>

		<div class="practice-editor__field">
			Songs to prepare
			<div v-for="(_, index) in songs" :key="index" class="practice-editor__song">
				<InputText v-model="songs[index]" />
				<Button type="button" label="Remove" severity="secondary" @click="songs.splice(index, 1)" />
			</div>
			<Button type="button" label="+ Add a song" severity="secondary" @click="songs.push('')" />
		</div>

		<label class="practice-editor__field">
			Recap (one line each)
			<Textarea v-model="recapText" rows="4" auto-resize />
		</label>

		<p v-if="error" class="practice-editor__error">{{ error }}</p>

		<div class="form-status-card__actions">
			<Button type="submit" label="Save" :disabled="!valid || saving" />
			<Button type="button" label="Cancel" severity="secondary" @click="emit('close')" />
		</div>
	</form>
</template>

<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
	import Button from 'primevue/button';
	import InputText from 'primevue/inputtext';
	import SelectButton from 'primevue/selectbutton';
	import Textarea from 'primevue/textarea';
	import type { Practice, PracticeInput, PracticeStatus } from '@models/practice';
	import { BandApiError } from '@utils/band-api';
	import { formatCalendarDate } from '@utils/dates';
	import { parsePracticeInput } from '@utils/practice-input';
	import { PRACTICE_HOME } from '@utils/practices';
	import { useBandStore } from '@/stores/band';

	// The admin's editor for one practice (or a new one). It sends the whole record through `band.savePractice`.
	const props = defineProps<{ practice?: Practice }>();
	const emit = defineEmits<{ close: [] }>();

	const band = useBandStore();

	const date = ref(props.practice?.date ?? '');
	const startTime = ref(props.practice?.startTime ?? '');
	const endTime = ref(props.practice?.endTime ?? '');
	const location = ref(props.practice?.location ?? '');
	const status = ref<PracticeStatus>(props.practice?.status ?? 'scheduled');
	const songs = ref<string[]>([...(props.practice?.prepare ?? [])]);
	const recapText = ref((props.practice?.recap ?? []).join('\n'));

	// `complete` comes only from the import: it's shown when the practice already is, and never offered otherwise.
	const statusOptions = [
		{ label: 'Tentative', value: 'tentative' },
		{ label: 'Scheduled', value: 'scheduled' },
		{ label: 'Cancelled', value: 'cancelled' },
		...(props.practice?.status === 'complete' ? [{ label: 'Complete', value: 'complete' }] : [])
	];

	/** The body to send. Empty strings mean "not set", and blank songs and recap lines are dropped. */
	const body = computed(() => ({
		date: date.value,
		...(startTime.value || endTime.value
			? { startTime: startTime.value || undefined, endTime: endTime.value || undefined }
			: {}),
		...(location.value.trim() ? { location: location.value.trim() } : {}),
		status: status.value,
		prepare: songs.value.map(song => song.trim()).filter(Boolean),
		recap: recapText.value
			.split('\n')
			.map(line => line.trim())
			.filter(Boolean)
	}));

	// The same checks the server runs, so a problem shows before the request.
	const checked = computed(() => parsePracticeInput(body.value));
	const valid = computed(() => checked.value.ok);

	const MESSAGES: Record<string, string> = {
		'bad-date': 'Pick a date.',
		'bad-time': 'Set both times, with the end after the start, or leave both empty.',
		'bad-location': 'Keep the location to 80 characters.',
		'bad-lines': 'Songs are up to 120 characters and recap lines up to 300, 30 of each at most.',
		'bad-status': "That status can't be set here."
	};

	const error = ref('');
	const saving = ref(false);

	// A warning before the tab closes with edits that haven't been saved.
	const initial = JSON.stringify(body.value);
	const dirty = () => JSON.stringify(body.value) !== initial;
	const warn = (event: BeforeUnloadEvent) => {
		if (dirty()) {
			event.preventDefault();
			event.returnValue = '';
		}
	};
	onMounted(() => window.addEventListener('beforeunload', warn));
	onBeforeUnmount(() => window.removeEventListener('beforeunload', warn));

	const save = async () => {
		const input = checked.value;
		if (!input.ok) {
			error.value = MESSAGES[input.error] ?? 'Check the fields and try again.';
			return;
		}

		saving.value = true;
		error.value = '';
		try {
			await band.savePractice(input.value as PracticeInput, props.practice?.id);
			emit('close');
		} catch (caught) {
			if (caught instanceof BandApiError && caught.code === 'date-taken') {
				error.value = `Another practice is already on ${formatCalendarDate(date.value, {
					month: 'long',
					day: 'numeric'
				})}.`;
			} else if (caught instanceof BandApiError && caught.status !== 401) {
				error.value = MESSAGES[caught.code] ?? "Couldn't save that. Try again.";
			}
		} finally {
			saving.value = false;
		}
	};
</script>
