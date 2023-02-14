<template>
	<router-link class="image-link" :to="linkTo" :title="overlayText">
		<div class="image-overlay"></div>
		<img :src="imgSrc" :alt="imgAlt" />
	</router-link>
</template>

<script setup lang="ts">
	defineProps<{ imgAlt: string; imgSrc: string; linkTo: string; overlayText: string }>();
</script>
