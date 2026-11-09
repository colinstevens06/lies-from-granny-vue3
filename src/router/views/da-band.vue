<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<h1 class="da-band__title">Da Band</h1>

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

				<section v-if="recaps.length" class="da-band__section">
					<h2>Recaps</h2>
					<article v-for="practice in recaps" :key="practice.id" class="band-card">
						<div class="band-card__title">{{ formatPracticeDay(practice) }}</div>
						<ul>
							<li v-for="line in practice.recap" :key="line">{{ line }}</li>
						</ul>
					</article>
				</section>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '@router/layouts/main.vue';
	import NextGig from '@components/band/next-gig.vue';
	import PracticeCard from '@components/band/practice-card.vue';
	import { practices } from '@components/band/practices';
	import { shows } from '@components/shows/shows';
	import { easternNow } from '@utils/dates';
	import { formatPracticeDay, practiceRecaps, upcomingPractices } from '@utils/practices';
	import { upcomingShows } from '@utils/shows';

	const now = easternNow();
	const today = now.slice(0, 10);

	const upcoming = upcomingPractices(practices, now);
	const nextPractice = upcoming.find(practice => practice.status === 'scheduled');
	const laterPractices = upcoming.filter(practice => practice !== nextPractice);
	const nextGig = upcomingShows(shows)[0];
	const recaps = practiceRecaps(practices);
</script>
