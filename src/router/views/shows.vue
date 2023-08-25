<template>
	<Layout>
		<!-- <div className="main-image-container__shows"></div> -->
		<div class="main-container">
			<h2>Upcoming Shows</h2>
			<ShowsContainer v-if="upcomingShowsNew.length > 0" :gigs="upcomingShowsNew" />
			<p v-else>
				Nothing coming up currently. Follow us on
				<a :href="urls.instagram" target="_blank">Instagram</a>
				and
				<a :href="urls.facebook" target="_blank">Facebook</a>
				for the latest event information.
			</p>
			<h2>Past Shows</h2>
			<ShowsContainer :gigs="pastShowsNew" />
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '@router/layouts/main.vue';
	import ShowsContainer from '@components/shows/past-shows.vue';
	import { shows } from '@components/shows/shows';
	import { urls } from '@utils/urls';
	import { computed } from 'vue';

	const upcomingShowsNew = computed(() =>
		shows.filter(show => {
			const todayMidnight = new Date(`${show.date} 23:59:59`);

			return todayMidnight.getTime() >= new Date().getTime();
		})
	);

	const pastShowsNew = computed(() =>
		shows.filter(show => {
			const todayMidnight = new Date(`${show.date} 23:59:59`);

			return todayMidnight.getTime() < new Date().getTime();
		})
	);
</script>
@/components/shows/shows
