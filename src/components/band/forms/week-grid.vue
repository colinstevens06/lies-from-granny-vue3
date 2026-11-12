<template>
	<div class="week-grid">
		<div class="week-grid__legend">
			<span>
				<i class="answer-cell--none" />
				Blank
			</span>
			<span>
				<i class="answer-cell--yes" />
				Yes
			</span>
			<span>
				<i class="answer-cell--no" />
				No
			</span>
			<span>
				<i class="answer-cell--maybe" />
				Not sure
			</span>
			<span>Tap to cycle</span>
		</div>
		<div class="week-grid__row">
			<span />
			<div v-for="name in WEEKDAY_NAMES" :key="name" class="week-grid__dow">{{ name }}</div>
		</div>
		<div v-for="week in weeks" :key="week.find(Boolean)" class="week-grid__row">
			<span class="week-grid__label">{{ weekLabel(week) }}</span>
			<template v-for="(day, index) in week" :key="index">
				<AnswerCell
					v-if="day"
					:date="day"
					:answer="myDays[day]?.answer"
					:disabled="day < today"
					@change="(date, answer) => emit('change', date, answer)"
				/>
				<span v-else class="week-grid__out" />
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Answer, DayAnswer } from '@models/availability';
	import { formatCalendarDate } from '@utils/dates';
	import { weeksInRange } from '@utils/band-calendar';
	import AnswerCell from './answer-cell.vue';

	const WEEKDAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	// One line per week (Sunday first), seven answer cells each. Days outside [startDay, endDay] are blank space.
	const props = defineProps<{
		startDay: string;
		endDay: string;
		myDays: Record<string, Pick<DayAnswer, 'answer'>>;
		/** Eastern 'YYYY-MM-DD'. Earlier days can't be tapped. */
		today: string;
	}>();

	const emit = defineEmits<{ change: [date: string, answer: Answer] }>();

	const weeks = computed(() => weeksInRange(props.startDay, props.endDay));

	const weekLabel = (week: (string | undefined)[]) => {
		const first = week.find(Boolean);
		return first ? formatCalendarDate(first, { month: 'short', day: 'numeric' }) : '';
	};
</script>
