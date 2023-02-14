<template>
	<div class="grid new-three-pack main-container py-5 surface-200">
		<template v-for="detail in threePackContent" :key="detail.linkTo">
			<div class="col-12 md:col-4 flex justify-content-center flex-column align-items-center">
				<CircleImage
					:img-alt="detail.imgAlt"
					:img-src="detail.imgSrc"
					:link-to="detail.linkTo"
					:overlay-text="detail.overlayText"
				/>
				<router-link class="no-underline mt-3 text-900 text-xl font-bold" :to="detail.linkTo">
					{{ detail.overlayText }}
				</router-link>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
	import CircleImage from '@components/home/circle-image.vue';

	const threePackContent = [
		{
			imgAlt: 'Lies From Granny in concert',
			imgSrc: '/images/home/shows-thumb-2.jpg',
			linkTo: 'shows',
			overlayText: 'Shows'
		},
		{
			imgAlt: 'Set list from a recent Lies From Granny show at Sollys in DC',
			imgSrc: '/images/home/Lies-From-Granny-Songs.jpg',
			linkTo: 'songs',
			overlayText: 'Songs'
		},
		{
			imgAlt: 'Lies From Granny logo',
			imgSrc: '/images/home/Granny-Logo.jpg',
			linkTo: 'contact',
			overlayText: 'Contact'
		}
	];
</script>
