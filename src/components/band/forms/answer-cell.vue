<template>
	<!-- eslint-disable-next-line vue/no-restricted-html-elements -- a calendar cell with a 3-state tap cycle, not a standard button -->
	<button
		type="button"
		class="answer-cell"
		:class="[`answer-cell--${answer ?? 'none'}`, { 'answer-cell--dim': disabled }]"
		:disabled="disabled"
		:data-day="date"
		:aria-label="`${label}: ${ANSWER_LABEL[answer ?? 'none']}`"
		@click="emit('change', date, nextAnswer(answer))"
	>
		{{ Number(date.slice(8)) }}
		<small>{{ answer ? ANSWER_LABEL[answer] : '—' }}</small>
	</button>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Answer } from '@models/availability';
	import { formatCalendarDate } from '@utils/dates';
	import { ANSWER_LABEL, nextAnswer } from '@utils/band-calendar';

	// One day, one answer, tap to cycle (blank → Yes → No → Not sure → Yes). It owns no state: the parent passes the
	// answer back in, so the same cell serves the sign-off form and P6's Edit mine.
	const props = defineProps<{
		/** Eastern 'YYYY-MM-DD'. */
		date: string;
		answer?: Answer;
		/** Past days stay visible but can't be tapped. */
		disabled?: boolean;
	}>();

	const emit = defineEmits<{ change: [date: string, answer: Answer] }>();

	const label = computed(() => formatCalendarDate(props.date, { weekday: 'short', month: 'short', day: 'numeric' }));
</script>
