<template>
	<Sidebar
		:visible="visible"
		position="bottom"
		header="Fill a weekday at once"
		class="weekday-fill"
		@update:visible="emit('update:visible', $event)"
	>
		<p class="weekday-fill__note">Fills only the days you haven't answered. Anything you picked stays as it is.</p>
		<div v-for="(name, weekday) in WEEKDAYS" :key="name" class="weekday-fill__row">
			<b>{{ name }}</b>
			<button
				v-for="answer in ANSWERS"
				:key="answer"
				type="button"
				class="weekday-fill__button"
				:class="{ 'weekday-fill__button--done': last[weekday]?.answer === answer }"
				@click="fill(weekday, answer)"
			>
				{{ ANSWER_LABEL[answer] }}
			</button>
			<small role="status">{{ status(weekday) }}</small>
		</div>
	</Sidebar>
</template>

<script setup lang="ts">
	import { reactive, watch } from 'vue';
	import Sidebar from 'primevue/sidebar';
	import type { Answer } from '@models/availability';
	import { ANSWER_LABEL } from '@utils/band-calendar';

	const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const ANSWERS: Answer[] = ['yes', 'no', 'maybe'];

	const props = defineProps<{
		visible: boolean;
		/** Blank in-range days per weekday (Sunday = 0); a weekday with none can't be tapped. */
		blankCounts: number[];
	}>();

	const emit = defineEmits<{
		'update:visible': [visible: boolean];
		/** `weekday` is 0 (Sunday) to 6. */
		fill: [weekday: number, answer: Answer];
	}>();

	// What the last tap on each weekday did, so the sheet can stay open and still say something happened.
	const last = reactive<Record<number, { answer: Answer; filled: number }>>({});

	watch(
		() => props.visible,
		() => Object.keys(last).forEach(key => delete last[Number(key)])
	);

	const fill = (weekday: number, answer: Answer) => {
		last[weekday] = { answer, filled: props.blankCounts[weekday] };
		if (props.blankCounts[weekday] > 0) emit('fill', weekday, answer);
	};

	const status = (weekday: number) => {
		const tapped = last[weekday];
		if (!tapped) return `${props.blankCounts[weekday]} blank`;
		if (tapped.filled === 0) return 'Nothing left to fill';
		return `${tapped.filled} ${tapped.filled === 1 ? 'day' : 'days'} filled ✓`;
	};
</script>
