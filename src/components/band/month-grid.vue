<template>
	<section class="month-grid">
		<header class="month-grid__header">
			<Button icon="pi pi-chevron-left" text :disabled="index === 0" aria-label="Previous month" @click="index--" />
			<div class="month-grid__title">
				<strong>{{ month.label }}</strong>
				<small v-if="inForm">In the {{ form?.title }} form</small>
			</div>
			<Button
				icon="pi pi-chevron-right"
				text
				:disabled="index === months.length - 1"
				aria-label="Next month"
				@click="index++"
			/>
		</header>

		<div class="month-grid__row month-grid__row--dow">
			<span v-for="(name, i) in WEEKDAY_NAMES" :key="i">{{ name }}</span>
		</div>
		<div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="month-grid__row">
			<template v-for="(day, dayIndex) in week" :key="dayIndex">
				<slot v-if="day" name="day" :date="day" :past="day < today" />
				<span v-else />
			</template>
		</div>
	</section>
</template>

<script setup lang="ts">
	import { computed, ref } from 'vue';
	import Button from 'primevue/button';
	import type { Form } from '@models/form';
	import { monthsFrom, weeksInRange } from '@utils/band-calendar';

	// One month at a time from the current month through December of next year. It only lays out the days: the
	// parent's `day` slot draws each one, so the band calendar and Edit mine share this grid.
	const props = defineProps<{
		/** Eastern 'YYYY-MM-DD'. */
		today: string;
		/** The open availability form, so its months can be labeled. */
		form?: Form;
	}>();

	const WEEKDAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	const months = monthsFrom(props.today);
	const index = ref(0);
	const month = computed(() => months[index.value]);
	const weeks = computed(() => weeksInRange(month.value.firstDay, month.value.lastDay));

	const inForm = computed(() => {
		const range = props.form?.availability;
		return range !== undefined && month.value.firstDay <= range.endDay && month.value.lastDay >= range.startDay;
	});
</script>
