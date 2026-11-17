<template>
	<section class="flex flex-column gap-1">
		<header class="flex align-items-center justify-content-between gap-2">
			<Button icon="pi pi-chevron-left" text :disabled="index === 0" aria-label="Previous month" @click="index--" />
			<div class="flex flex-column align-items-center text-center">
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

		<div :style="ROW_STYLE" class="text-center text-xs text-black-alpha-60">
			<span v-for="(name, i) in WEEKDAY_INITIALS" :key="i">{{ name }}</span>
		</div>
		<div v-for="(week, weekIndex) in weeks" :key="weekIndex" :style="ROW_STYLE">
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
	import { WEEKDAY_INITIALS, monthsFrom, weeksInRange } from '@utils/da-band/band-calendar';

	// One month at a time from the current month through December of next year. It only lays out the days: the
	// parent's `day` slot draws each one, so the band calendar and Edit mine share this grid.
	const props = defineProps<{
		/** Eastern 'YYYY-MM-DD'. */
		today: string;
		/** The open availability form, so its months can be labeled. */
		form?: Form;
	}>();

	// Seven equal columns, Sunday first. PrimeFlex 3 has no grid-template utilities.
	const ROW_STYLE = { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' };

	// The range follows `today`, so a tab open across New Year gains next year's months. The shown month is kept by its
	// first day, not its position, and falls back to the current month once it drops out of the range.
	const months = computed(() => monthsFrom(props.today));
	const shownDay = ref<string>();
	const index = computed({
		get: () =>
			Math.max(
				0,
				months.value.findIndex(m => m.firstDay === shownDay.value)
			),
		set: value => (shownDay.value = months.value[value]?.firstDay)
	});
	const month = computed(() => months.value[index.value]);
	const weeks = computed(() => weeksInRange(month.value.firstDay, month.value.lastDay));

	const inForm = computed(() => {
		const range = props.form?.availability;
		return range !== undefined && month.value.firstDay <= range.endDay && month.value.lastDay >= range.startDay;
	});
</script>
