<template>
	<div>
		<MonthGrid :today="today" :form="form">
			<template #day="{ date, past }">
				<CalendarDay
					:date="date"
					:past="past"
					:status="calendarDayStatus(date, band.availability, band.practices, shows)"
					:availability="band.availability"
					@select="selected = $event"
				/>
			</template>
		</MonthGrid>
		<DayAnswersSheet :date="selected" :availability="band.availability" @close="selected = undefined" />
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import type { Form } from '@models/form';
	import CalendarDay from '@components/band/calendar-day.vue';
	import DayAnswersSheet from '@components/band/day-answers-sheet.vue';
	import MonthGrid from '@components/band/month-grid.vue';
	import { shows } from '@components/shows/shows';
	import { calendarDayStatus } from '@utils/band-calendar';
	import { useBandStore } from '@/stores/band';

	// The shared calendar: each day's status fill plus five member dots. Tapping a day opens everyone's answers.
	defineProps<{ today: string; form?: Form }>();

	const band = useBandStore();
	const selected = ref<string>();
</script>
