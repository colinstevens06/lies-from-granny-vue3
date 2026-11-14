<template>
	<section v-if="days.length || form" class="flex flex-column gap-2 p-3 border-round-lg bg-poster-yellow">
		<p class="m-0 font-bold">{{ header }}</p>
		<ul v-if="days.length" class="flex flex-wrap gap-2 m-0 p-0 list-none">
			<li v-for="day in days" :key="day" class="py-1 px-2 border-round-3xl bg-white">
				{{ formatCalendarDate(day, { weekday: 'short', month: 'short', day: 'numeric' }) }}
			</li>
		</ul>
		<p v-else class="text-black-alpha-70">No dates work for everyone yet.</p>
		<CopyButton v-if="days.length" label="Copy list" :text="possibleListText(days, header)" />

		<template v-if="nights.length">
			<p class="m-0 mt-2 font-bold">Show nights · {{ nights.length }} {{ nights.length === 1 ? 'night' : 'nights' }}</p>
			<ul class="flex flex-wrap gap-2 m-0 p-0 list-none">
				<li
					v-for="day in nights"
					:key="day"
					class="py-1 px-2 border-1 border-round-3xl border-lfg-pink bg-lfg-pink-tint"
				>
					{{ formatCalendarDate(day, { weekday: 'short', month: 'short', day: 'numeric' }) }}
				</li>
			</ul>
			<CopyButton label="Copy show nights" :text="possibleListText(nights, 'Show nights that work for everyone:')" />
		</template>
	</section>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Form } from '@models/form';
	import CopyButton from '@components/da-band/copy-button.vue';
	import { shows } from '@components/shows/shows';
	import { possibleDates, possibleListText, practicesStillNeeded, showNights, targetOf } from '@utils/band-calendar';
	import { formatCalendarDate } from '@utils/dates';
	import { useEasternNow } from '@/composables/use-eastern-now';
	import { useBandStore } from '@/stores/band';

	// Upcoming days all five can practice with nothing booked, then the Fridays and Saturdays among them all five can also play. With an open availability form it's headed by how many
	// practices that form still wants and what they're for.
	const props = defineProps<{ form?: Form }>();

	const band = useBandStore();
	// The reactive Eastern day, so a tab left open past midnight drops yesterday from the lists.
	const { today } = useEasternNow();
	const days = computed(() => possibleDates(props.form, band.availability, band.practices, shows, today.value));
	const nights = computed(() => showNights(props.form, band.availability, band.practices, shows, today.value));

	const header = computed(() => {
		const works = `${days.value.length} ${days.value.length === 1 ? 'date works' : 'dates work'}`;
		if (!props.form) return `Possible dates · ${works}`;

		const needed = practicesStillNeeded(props.form, band.practices, shows);
		const found = targetOf(props.form, shows, today.value);
		const target = found?.label;
		if (needed === undefined || !target) return `Possible dates · ${works}`;

		return `${needed} ${needed === 1 ? 'practice' : 'practices'} to schedule before ${target} · ${works}`;
	});
</script>
