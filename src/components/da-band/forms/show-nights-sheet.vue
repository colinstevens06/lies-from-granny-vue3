<template>
	<Sidebar
		:visible
		position="bottom"
		header="Confirm show nights"
		class="weekday-fill"
		@update:visible="emit('update:visible', $event)"
	>
		<p class="mt-0 mb-2 font-bold">
			You can play a show on {{ summary.playable.length }} of {{ summary.total }} Friday and Saturday nights.
		</p>
		<ul v-if="summary.playable.length" class="flex flex-wrap gap-2 m-0 mb-3 p-0 list-none">
			<li
				v-for="day in summary.playable"
				:key="day"
				class="py-1 px-2 border-1 border-round-3xl border-lfg-pink bg-lfg-pink-tint text-sm"
			>
				{{ dayLabel(day) }}
			</li>
		</ul>

		<template v-if="summary.practiceOnly.length">
			<p class="mt-0 mb-2 font-bold">Practice only, no show ({{ summary.practiceOnly.length }})</p>
			<ul class="flex flex-wrap gap-2 m-0 mb-3 p-0 list-none">
				<li v-for="day in summary.practiceOnly" :key="day" class="py-1 px-2 border-round-3xl surface-200 text-sm">
					{{ dayLabel(day) }}
				</li>
			</ul>
		</template>

		<div class="flex flex-wrap gap-2 mt-3">
			<Button label="Looks right, sign off" :disabled="busy" @click="emit('confirm')" />
			<Button label="Go back" severity="secondary" outlined @click="emit('update:visible', false)" />
		</div>
	</Sidebar>
</template>

<script setup lang="ts">
	import Button from 'primevue/button';
	import Sidebar from 'primevue/sidebar';
	import type { ShowNightSummary } from '@models/band-calendar';
	import { formatShortDay } from '@utils/dates';

	// The last look before sign-off: a show answer silently follows the day's answer, so every cell missed as "Yes, no
	// show" would read as "she can play". Go back leaves the member unsigned on the grid.
	defineProps<{ visible: boolean; summary: ShowNightSummary; busy?: boolean }>();

	const emit = defineEmits<{ 'update:visible': [visible: boolean]; confirm: [] }>();

	const dayLabel = formatShortDay;
</script>
