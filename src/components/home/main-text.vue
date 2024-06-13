<template>
	<div class="main-container my-5">
		<h2>High-Energy Pop Rock Cover Band</h2>
		<p>
			Lies From Granny is a five-piece rock cover band who brings a party environment while playing a mix of rock, pop
			punk and anything else you might want to dance to.
		</p>
		<p>
			We love learning new songs and are always adding new tunes to our arsenal. So anytime you see us, expect to see a
			different show than last time.
		</p>
		<p>
			You can find us at venues in the Baltimore and D.C. areas. Have a song you think we should learn? A place we
			should play? Drop us a note on
			<a href="https://www.instagram.com/liesfromgranny/" target="_blank" rel="noopener noreferrer">Instagram</a>
			or
			<!-- prettier-ignore -->
			<span><a :href="urls.facebook" target="_blank" rel="noopener noreferrer">Facebook</a>.</span>
		</p>
		<p class="mb-3">
			Want to book us for a show?
			<!-- prettier-ignore -->
			<span><router-link to="/contact">We'd love to hear from you</router-link>.</span>
		</p>
	</div>
</template>

<script setup lang="ts">
	import { urls } from '@utils/urls';
</script>
