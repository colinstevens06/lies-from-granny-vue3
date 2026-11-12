<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<h1 class="da-band__title">Da Band</h1>

				<p v-if="band.loadState !== 'ready'" class="band-card band-card__empty">
					{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
				</p>

				<section class="da-band__section">
					<h2>Next practice</h2>
					<PracticeCard v-if="nextPractice" :practice="nextPractice" featured />
					<p v-else class="band-card band-card--featured band-card__empty">No practice on the calendar.</p>
				</section>

				<section class="da-band__section">
					<h2>Next gig</h2>
					<NextGig :gig="nextGig" :today="today" />
				</section>

				<section v-if="laterPractices.length" class="da-band__section">
					<h2>Upcoming practices</h2>
					<PracticeCard v-for="practice in laterPractices" :key="practice.id" :practice="practice" />
				</section>

				<RouterLink to="/da-band/history" class="band-link">Practice history &rarr;</RouterLink>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import NextGig from '@components/band/next-gig.vue';
	import PracticeCard from '@components/band/practice-card.vue';
	import { shows } from '@components/shows/shows';
	import { easternNow } from '@utils/dates';
	import { upcomingPractices } from '@utils/practices';
	import { upcomingShows } from '@utils/shows';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	const now = easternNow();
	const today = now.slice(0, 10);

	const upcoming = computed(() => upcomingPractices(band.practices, now));
	const nextPractice = computed(() => upcoming.value.find(practice => practice.status !== 'cancelled'));
	const laterPractices = computed(() => upcoming.value.filter(practice => practice !== nextPractice.value));
	const nextGig = upcomingShows(shows)[0];
</script>
