<template>
	<!-- eslint-disable-next-line vue/no-restricted-html-elements -- a calendar cell with a tap cycle, not a standard button -->
	<button
		type="button"
		class="answer-cell relative overflow-hidden flex flex-column align-items-center justify-content-center py-1 px-0 border-none border-round text-sm font-bold line-height-1"
		:class="[`answer-cell--${answer ?? 'none'}`, disabled ? 'opacity-40' : 'cursor-pointer']"
		style="min-height: 46px"
		:disabled="disabled"
		:data-day="date"
		:aria-label="`${label}: ${state}`"
		@click="emit('change', { date, ...nextDayChange(date, { answer, showAnswer }) })"
	>
		{{ Number(date.slice(8)) }}
		<small class="font-medium" style="font-size: 10px">{{ answer ? ANSWER_LABEL[answer] : '—' }}</small>
		<span
			v-if="noShow"
			class="absolute left-0 right-0 bottom-0 bg-gray-900 text-white font-medium"
			style="font-size: 8px; line-height: 11px"
		>
			no show
		</span>
	</button>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Answer, MyAnswer } from '@models/availability';
	import { formatShortDay } from '@utils/dates';
	import { ANSWER_LABEL, nextDayChange } from '@utils/band-calendar';

	// One day, one answer, tap to cycle (blank → Yes → No → Not sure → Yes; a Friday or Saturday adds "Yes, no show"
	// after Yes). It owns no state: the parent passes the answer back in, so the same cell serves the sign-off form and
	// P6's Edit mine.
	const props = defineProps<{
		/** Eastern 'YYYY-MM-DD'. */
		date: string;
		answer?: Answer;
		/** Set on a Yes Friday or Saturday that can't play the show. */
		showAnswer?: Answer;
		/** Past days stay visible but can't be tapped. */
		disabled?: boolean;
	}>();

	const emit = defineEmits<{ change: [change: MyAnswer] }>();

	const label = computed(() => formatShortDay(props.date));
	const noShow = computed(() => props.answer === 'yes' && props.showAnswer !== undefined);
	const state = computed(() => `${ANSWER_LABEL[props.answer ?? 'none']}${noShow.value ? ', no show' : ''}`);
</script>
