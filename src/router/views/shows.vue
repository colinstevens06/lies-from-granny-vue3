<template>
	<Layout>
		<!-- <div className="main-image-container__shows"></div> -->
		<div class="main-container">
			<h2>Upcoming Shows</h2>
			<ShowsContainer v-if="upcoming.length > 0" :gigs="upcoming" />
			<p v-else>
				Nothing coming up currently. Follow us on
				<a :href="urls.instagram" target="_blank">Instagram</a>
				and
				<a :href="urls.facebook" target="_blank">Facebook</a>
				for the latest event information.
			</p>
			<h2>Past Shows</h2>
			<ShowsContainer :gigs="past" />
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '@router/layouts/main.vue';
	import ShowsContainer from '@components/shows/past-shows.vue';
	import { shows } from '@components/shows/shows';
	import { urls } from '@utils/urls';
	import { pastShows, upcomingShows } from '@utils/shows';

	const upcoming = upcomingShows(shows);
	const past = pastShows(shows);
</script>
