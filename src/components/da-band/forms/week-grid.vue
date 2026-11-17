<template>
	<div class="flex flex-column gap-1">
		<LegendKeys :items="ANSWER_LEGEND" class="mb-2" />
		<div :style="ROW_STYLE">
			<span />
			<div
				v-for="(name, index) in WEEKDAY_INITIALS"
				:key="index"
				class="text-xs font-bold text-center text-black-alpha-70"
			>
				{{ name }}
			</div>
		</div>
		<div v-for="week in weeks" :key="week.find(Boolean)" :style="ROW_STYLE">
			<span class="text-xs font-bold text-black-alpha-70">{{ weekLabel(week) }}</span>
			<template v-for="(day, index) in week" :key="index">
				<AnswerCell
					v-if="day"
					:date="day"
					:answer="myDays[day]?.answer"
					:show-answer="myDays[day]?.showAnswer"
					:disabled="day < today"
					@change="change => emit('change', change)"
				/>
				<span v-else />
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { DayAnswer, MyAnswer } from '@models/availability';
	import { formatMonthDay } from '@utils/dates';
	import { WEEKDAY_INITIALS, weeksInRange } from '@utils/da-band/band-calendar';
	import LegendKeys from '@components/da-band/legend-keys.vue';
	import { ANSWER_LEGEND } from './answer-legend';
	import AnswerCell from './answer-cell.vue';

	// A week label, then Sunday through Saturday. PrimeFlex 3 has no grid-template utilities.
	const ROW_STYLE = {
		display: 'grid',
		gridTemplateColumns: '54px repeat(7, minmax(0, 1fr))',
		gap: '4px',
		alignItems: 'center'
	};

	// One line per week (Sunday first), seven answer cells each. Days outside [startDay, endDay] are blank space.
	const props = defineProps<{
		startDay: string;
		endDay: string;
		myDays: Record<string, Pick<DayAnswer, 'answer' | 'showAnswer'>>;
		/** Eastern 'YYYY-MM-DD'. Earlier days can't be tapped. */
		today: string;
	}>();

	const emit = defineEmits<{ change: [change: MyAnswer] }>();

	const weeks = computed(() => weeksInRange(props.startDay, props.endDay));

	const weekLabel = (week: (string | undefined)[]) => {
		const first = week.find(Boolean);
		return first ? formatMonthDay(first) : '';
	};
</script>
