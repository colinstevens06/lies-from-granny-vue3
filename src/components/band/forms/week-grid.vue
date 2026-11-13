<template>
	<div class="flex flex-column gap-1">
		<div class="flex flex-wrap align-items-center column-gap-3 row-gap-1 mb-2 text-xs text-black-alpha-70">
			<span v-for="item in LEGEND" :key="item.label" class="inline-flex align-items-center gap-1">
				<i class="block flex-none w-1rem h-1rem border-round" :class="item.swatch" />
				{{ item.label }}
			</span>
		</div>
		<div :style="ROW_STYLE">
			<span />
			<div
				v-for="(name, index) in WEEKDAY_NAMES"
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
					:disabled="day < today"
					@change="(date, answer) => emit('change', date, answer)"
				/>
				<span v-else />
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

	const LEGEND = [
		{ label: 'Blank', swatch: 'answer-cell--none' },
		{ label: 'Yes', swatch: 'answer-cell--yes' },
		{ label: 'No', swatch: 'answer-cell--no' },
		{ label: 'Not sure', swatch: 'answer-cell--maybe' }
	];

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
