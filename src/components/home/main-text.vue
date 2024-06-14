<template>
	<div class="main-container my-5">
		<h2>High-Energy Pop Rock Cover Band</h2>
		<p>
			Lies From Granny is a five-piece pop rock cover band from the Washington D.C. - Baltimore area who always brings
			the party to every stage they hit
		</p>
		<p>
			Come out to a Lies From Granny show and you'll be dancing and singing along to your favorite songs all night long.
			We play covers of popular rock hits from the late 90's and early 2000's that you're sure to enjoy, and we're known
			to throw fun tunes from other decades in the mix too.
		</p>
		<p>
			You can find us rocking out at venues across D.C., Maryland and Virginia. We'd love to see you at a show! Follow
			us on social media to see where we'll be next, or
			<router-link to="/contact">book us for your next event</router-link>
		</p>
		<p class="font-bold">Follow Us!</p>
		<ul class="list-none pl-0">
			<li>
				<a href="https://www.instagram.com/liesfromgranny/" target="_blank" rel="noopener noreferrer">Instagram</a>
			</li>
			<li class="mt-1"><a :href="urls.facebook" target="_blank" rel="noopener noreferrer">Facebook</a></li>
		</ul>
	</div>
</template>

<script setup lang="ts">
	import { urls } from '@utils/urls';
</script>
