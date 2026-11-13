<template>
	<article class="band-card">
		<template v-if="gig">
			<div class="text-2xl font-bold text-lfg-pink">{{ countdown }}</div>
			<div class="text-xl font-bold">{{ gig.name }}</div>
			<div class="text-black-alpha-70">{{ gig.date }}</div>
			<BandLink to="/shows">Show details</BandLink>
		</template>
		<p v-else class="m-0 text-xl font-bold">Nothing on the books right now.</p>
	</article>
</template>

<script setup lang="ts">
	import type { Gig } from '@models/gig';
	import BandLink from '@components/band/band-link.vue';
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
