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
				:disabled="blankCounts[weekday] === 0"
				@click="emit('fill', weekday, answer)"
			>
				{{ ANSWER_LABEL[answer] }}
			</button>
			<small>{{ blankCounts[weekday] }} blank</small>
		</div>
	</Sidebar>
</template>

<script setup lang="ts">
	import Sidebar from 'primevue/sidebar';
	import type { Answer } from '@models/availability';
	import { ANSWER_LABEL } from '@utils/band-calendar';

	const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const ANSWERS: Answer[] = ['yes', 'no', 'maybe'];

	defineProps<{
		visible: boolean;
		/** Blank in-range days per weekday (Sunday = 0); a weekday with none can't be tapped. */
		blankCounts: number[];
	}>();

	const emit = defineEmits<{
		'update:visible': [visible: boolean];
		/** `weekday` is 0 (Sunday) to 6. */
		fill: [weekday: number, answer: Answer];
	}>();
</script>
