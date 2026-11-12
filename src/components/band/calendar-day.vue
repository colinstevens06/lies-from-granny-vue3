<template>
	<button
		type="button"
		class="calendar-day"
		:class="[`calendar-day--${status}`, { 'calendar-day--past': past }]"
		:disabled="past"
		:aria-label="`${label}: ${STATUS_LABEL[status]}`"
		@click="emit('select', date)"
	>
		<span class="calendar-day__number">{{ Number(date.slice(8)) }}</span>
		<span class="calendar-day__dots">
			<i
				v-for="entry in answers"
				:key="entry.member.id"
				class="calendar-day__dot"
				:class="`calendar-day__dot--${entry.answer ?? 'none'}`"
			/>
		</span>
	</button>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { MemberAvailability } from '@models/availability';
	import { dayAnswers, type DayStatus } from '@utils/band-calendar';
	import { formatCalendarDate } from '@utils/dates';

	const props = defineProps<{
		date: string;
		status: DayStatus;
		availability: MemberAvailability[];
		past?: boolean;
	}>();

	const emit = defineEmits<{ select: [date: string] }>();

	const STATUS_LABEL: Record<DayStatus, string> = {
		booked: 'booked',
		blocked: 'someone is busy',
		possible: 'everyone is free',
		open: 'open'
	};

	// Five dots, one per member in roster order: green Yes, pink No, orange Not sure, hollow Pending.
	const answers = computed(() => dayAnswers(props.date, props.availability));
	const label = computed(() => formatCalendarDate(props.date, { weekday: 'short', month: 'short', day: 'numeric' }));
</script>
