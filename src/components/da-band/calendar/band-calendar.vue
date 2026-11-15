<template>
	<div>
		<LegendKeys :items="CALENDAR_LEGEND" class="mb-2" />
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
	import CalendarDay from '@components/da-band/calendar/calendar-day.vue';
	import DayAnswersSheet from '@components/da-band/calendar/day-answers-sheet.vue';
	import LegendKeys from '@components/da-band/legend-keys.vue';
	import MonthGrid from '@components/da-band/calendar/month-grid.vue';
	import { CALENDAR_LEGEND } from '@components/da-band/calendar/day-status';
	import { shows } from '@components/shows/shows';
	import { calendarDayStatus } from '@utils/da-band/band-calendar';
	import { useBandStore } from '@/stores/band';

	// The shared calendar: each day's status fill (four keys, shown above it) plus five member dots. Tapping a day opens everyone's answers.
	defineProps<{ today: string; form?: Form }>();

	const band = useBandStore();
	const selected = ref<string>();
</script>
