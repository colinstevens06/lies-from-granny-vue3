<template>
	<Layout>
		<picture class="main-image-container">
			<source media="(min-width: 768px)" :srcset="desktopSrcset" sizes="100vw" />
			<img
				class="main-image"
				:src="mobileSrc"
				:srcset="mobileSrcset"
				sizes="100vw"
				width="500"
				height="625"
				alt="Lies From Granny band members with their instruments in front of a graffiti-covered wall"
				fetchpriority="high"
				decoding="async"
			/>
		</picture>
		<MainText />
		<ThreePack />
		<HomeVideo />
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '../layouts/main.vue';
	import MainText from '@components/home/main-text.vue';
	import ThreePack from '@components/home/three-pack.vue';
	import HomeVideo from '@components/home/home-video.vue';
	import { netlifyImage } from '@utils/images';

	const mobileSrc = netlifyImage('/images/home/lies-from-granny-mobile.jpg', 500);
	const mobileSrcset = `${mobileSrc} 500w, ${netlifyImage('/images/home/lies-from-granny-mobile.jpg', 1000)} 1000w`;
	const desktopSrcset = `${netlifyImage('/images/home/lies-from-granny.jpg', 1200)} 1200w, ${netlifyImage(
		'/images/home/lies-from-granny.jpg',
		1800
	)} 1800w`;
</script>
