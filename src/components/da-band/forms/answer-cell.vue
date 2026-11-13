<template>
	<!-- eslint-disable-next-line vue/no-restricted-html-elements -- a calendar cell with a 3-state tap cycle, not a standard button -->
	<button
		type="button"
		class="answer-cell flex flex-column align-items-center justify-content-center py-1 px-0 border-none border-round text-sm font-bold line-height-1"
		:class="[`answer-cell--${answer ?? 'none'}`, disabled ? 'opacity-40' : 'cursor-pointer']"
		style="min-height: 46px"
		:disabled="disabled"
		:data-day="date"
		:aria-label="`${label}: ${ANSWER_LABEL[answer ?? 'none']}`"
		@click="emit('change', date, nextAnswer(answer))"
	>
		{{ Number(date.slice(8)) }}
		<small class="font-medium" style="font-size: 10px">{{ answer ? ANSWER_LABEL[answer] : '—' }}</small>
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
