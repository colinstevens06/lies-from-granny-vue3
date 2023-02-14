<template>
	<Layout>
		<div class="main-image-container"></div>
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
</script>
