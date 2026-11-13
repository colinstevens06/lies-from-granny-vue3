<template>
	<section v-if="days.length || form" class="possible-dates">
		<p class="possible-dates__header">{{ header }}</p>
		<ul v-if="days.length" class="possible-dates__list">
			<li v-for="day in days" :key="day">
				{{ formatCalendarDate(day, { weekday: 'short', month: 'short', day: 'numeric' }) }}
			</li>
		</ul>
		<p v-else class="band-card__meta">No dates work for everyone yet.</p>
		<CopyButton v-if="days.length" label="Copy list" :text="possibleListText(days, header)" />
	</section>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Form } from '@models/form';
	import CopyButton from '@components/band/copy-button.vue';
	import { shows } from '@components/shows/shows';
	import { possibleDates, possibleListText, practicesStillNeeded, targetOf } from '@utils/band-calendar';
	import { formatCalendarDate } from '@utils/dates';
	import { useBandStore } from '@/stores/band';

	// Upcoming days all five said Yes to with nothing booked. With an open availability form it's headed by how many
	// practices that form still wants and what they're for.
	const props = defineProps<{ form?: Form }>();

	const band = useBandStore();
	const days = computed(() => possibleDates(props.form, band.availability, band.practices, shows));

	const header = computed(() => {
		const works = `${days.value.length} ${days.value.length === 1 ? 'date works' : 'dates work'}`;
		if (!props.form) return `Possible dates · ${works}`;

		const needed = practicesStillNeeded(props.form, band.practices, shows);
		const found = targetOf(props.form, shows);
		const target = found?.label;
		if (needed === undefined || !target) return `Possible dates · ${works}`;

		return `${needed} ${needed === 1 ? 'practice' : 'practices'} to schedule before ${target} · ${works}`;
	});
</script>
