<template>
	<router-link class="image-link" :to="linkTo" :title="overlayText">
		<div class="image-overlay"></div>
		<img :src="cdnSrc" :alt="imgAlt" loading="lazy" decoding="async" />
	</router-link>
</template>

<script setup lang="ts">
	import { netlifyImage } from '@utils/images';
	import { computed } from 'vue';

	const props = defineProps<{ imgAlt: string; imgSrc: string; linkTo: string; overlayText: string }>();

	// Circles render between 200px and 343px; 800px wide covers 2x displays.
	const cdnSrc = computed(() => netlifyImage(props.imgSrc, 800));
</script>
