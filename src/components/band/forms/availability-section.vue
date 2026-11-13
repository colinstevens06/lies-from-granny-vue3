<template>
	<section v-if="form.availability" class="flex flex-column gap-3">
		<p v-if="prefilled > 0" class="m-0 py-2 px-2 border-1 border-yellow-300 border-round bg-yellow-100 text-sm">
			{{ prefilled }} {{ prefilled === 1 ? 'date' : 'dates' }} came in from your calendar. Check them, change anything
			that's off, then sign off.
		</p>
		<div class="flex justify-content-center mt-4 mb-2">
			<Button
				label="Fill a weekday at once…"
				icon="pi pi-calendar-plus"
				severity="secondary"
				outlined
				size="small"
				@click="sheetOpen = true"
			/>
		</div>
		<WeekGrid
			:start-day="form.availability.startDay"
			:end-day="form.availability.endDay"
			:my-days="myDays"
			:today="today"
			@change="(date, answer) => emit('change', [{ date, answer }], false)"
		/>
		<WeekdayFillSheet
			v-model:visible="sheetOpen"
			:blank-counts="blankCounts"
			:day-counts="dayCounts"
			@fill="fillWeekday"
		/>
	</section>
</template>

<script setup lang="ts">
	import { computed, ref } from 'vue';
	import Button from 'primevue/button';
	import type { Answer, AvailabilityChange, DayAnswer } from '@models/availability';
	import type { Form } from '@models/form';
	import { addDays, weekdayIndex } from '@utils/dates';
	import { prefilledCount } from '@utils/band-calendar';
	import WeekGrid from './week-grid.vue';
	import WeekdayFillSheet from './weekday-fill-sheet.vue';

	// The availability part of a form, driven by `form.availability`. It owns no data: answers come in as `myDays` and
	// leave as `change` events, which the form shell passes to `band.setMyAnswers` (the availability save lane).
	const props = defineProps<{
		form: Form;
		/** The member's own answers, keyed by 'YYYY-MM-DD'. */
		myDays: Record<string, Pick<DayAnswer, 'answer'>>;
		/** Eastern 'YYYY-MM-DD'. */
		today: string;
	}>();

	const emit = defineEmits<{
		/** `immediate` is true for a weekday fill, which the save lane flushes without waiting. */
		change: [changes: AvailabilityChange[], immediate: boolean];
	}>();

	const sheetOpen = ref(false);

	// Counted once, when the form opens: it describes what was already on the calendar, not what was just tapped.
	const prefilled = ref(prefilledCount(props.form, props.myDays, props.today));

	/** Days from today through the range's end, grouped by weekday (Sunday = 0). Past days are never filled. */
	const openDaysByWeekday = computed(() => {
		const byWeekday: string[][] = Array.from({ length: 7 }, () => []);
		if (!props.form.availability) return byWeekday;

		const { startDay, endDay } = props.form.availability;
		for (let day = startDay < props.today ? props.today : startDay; day <= endDay; day = addDays(day, 1)) {
			byWeekday[weekdayIndex(day)].push(day);
		}
		return byWeekday;
	});

	const blankDaysByWeekday = computed(() =>
		openDaysByWeekday.value.map(days => days.filter(day => props.myDays[day] === undefined))
	);

	const blankCounts = computed(() => blankDaysByWeekday.value.map(days => days.length));
	const dayCounts = computed(() => openDaysByWeekday.value.map(days => days.length));

	/** `overwrite` also changes days already answered; otherwise only blank days are filled. */
	const fillWeekday = (weekday: number, answer: Answer, overwrite: boolean) => {
		const days = overwrite
			? openDaysByWeekday.value[weekday].filter(day => props.myDays[day]?.answer !== answer)
			: blankDaysByWeekday.value[weekday];
		const changes = days.map(date => ({ date, answer }));
		if (changes.length > 0) emit('change', changes, true);
	};
</script>
