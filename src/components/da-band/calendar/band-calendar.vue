<template>
	<div>
		<LegendKeys :items="CALENDAR_LEGEND" class="mb-2" />
		<MonthGrid :today :form>
			<template #day="{ date, past }">
				<CalendarDay
					:date
					:past
					:status="dayStatus(date)"
					:availability="availability.availability"
					@select="selected = $event"
				/>
			</template>
		</MonthGrid>
		<DayAnswersSheet :date="selected" :availability="availability.availability" @close="selected = undefined" />
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
	import { useBandCalendar } from '@/composables/use-band-calendar';
	import { useAvailabilityStore } from '@/stores/availability';

	// The shared calendar: each day's status fill (four keys, shown above it) plus five member dots. Tapping a day opens everyone's answers.
	defineProps<{ today: string; form?: Form }>();

	const availability = useAvailabilityStore();
	const { dayStatus } = useBandCalendar();
	const selected = ref<string>();
</script>
