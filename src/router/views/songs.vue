<template>
	<Layout>
		<div class="main-container">
			<h2>Song List</h2>
			<div class="grid">
				<div class="col-12 md:col-6 flex-order-6 md:flex-order-1">
					<p>
						We're always adding new songs to our binder. We try to pull from our influences but always with an ear to
						what our crowds will sing and dance along to.
					</p>
					<p>
						Pulling inspiration from a number of rock genres, we play songs that span several decades, back to the
						Beatles in the '60s up to some more recent jams.
					</p>
					<p>Our bread and butter: pop punk.</p>

					<p>
						Have ideas for a song we'd kill? Hit us up on
						<a href="https://www.instagram.com/liesfromgranny/" target="_blank" rel="noopener noreferrer">Instagram</a>
						or
						<!-- prettier-ignore -->
						<span><a :href="urls.facebook" target="_blank" rel="noopener noreferrer" >Facebook</a>.</span>
					</p>
					<p>
						Want to book us for a gig? We'll work with you to build a setlist for your audience.
						<RouterLink to="/contact">Contact us</RouterLink>
						about a booking.
					</p>
				</div>
				<div class="col-12 md:col-6 flex-order-1 md:flex-order-6 song-list-img">
					<img
						src="/images/home/Lies-From-Granny-Songs-List.jpg"
						alt="Setlist from a Lies From Granny show"
						class="img-fluid img-song-list"
					/>
				</div>
			</div>
			<SongsContainer />
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '../layouts/main.vue';
	import SongsContainer from '../../components/songs/songs-container.vue';
	import { urls } from '@utils/urls';
</script>
