<template>
	<article class="band-card next-gig">
		<template v-if="gig">
			<div class="next-gig__countdown">{{ countdown }}</div>
			<div class="band-card__title">{{ gig.name }}</div>
			<div class="band-card__meta">{{ gig.date }}</div>
			<RouterLink to="/shows" class="next-gig__link">Show details</RouterLink>
		</template>
		<p v-else class="band-card__empty">No gigs booked yet.</p>
	</article>
</template>

<script setup lang="ts">
	import type { Gig } from '@models/gig';
	import { daysBetween } from '@utils/dates';
	import { showIsoDate } from '@utils/shows';
	import { computed } from 'vue';

	const props = defineProps<{
		gig?: Gig;
		/** Today's Eastern date, 'YYYY-MM-DD'. */
		today: string;
	}>();

	const countdown = computed(() => {
		if (!props.gig) return '';

		const days = daysBetween(props.today, showIsoDate(props.gig));

		if (days <= 0) return 'Tonight';
		if (days === 1) return 'Tomorrow';
		return `${days} days out`;
	});
</script>
