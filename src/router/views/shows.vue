<template>
	<Layout>
		<!-- <div className="main-image-container__shows"></div> -->
		<div class="main-container">
			<h2>Upcoming Shows</h2>
			<ShowsContainer v-if="upcomingShows.length > 0" :gigs="upcomingShows" />
			<p v-else>
				Nothing coming up currently. Follow us on
				<a :href="urls.instagram" target="_blank">Instagram</a>
				and
				<a :href="urls.facebook" target="_blank">Facebook</a>
				for the latest event information.
			</p>
			<h2>Past Shows</h2>
			<ShowsContainer :gigs="pastShows" />
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '@router/layouts/main.vue';
	import ShowsContainer from '@components/shows/past-shows.vue';
	import { pastShows } from '@components/shows/past-shows';
	import { upcomingShows } from '@components/shows/upcoming-shows';
	import { urls } from '@utils/urls';
</script>
