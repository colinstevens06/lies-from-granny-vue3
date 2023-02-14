<template>
	<Layout>
		<!-- <div className="main-image-container__shows"></div> -->
		<div class="main-container">
			<h2>Upcoming Shows</h2>
			<ShowsContainer :gigs="upcomingShows" />
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
</script>
