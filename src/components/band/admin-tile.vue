<template>
	<component :is="to ? 'RouterLink' : 'article'" :to="to" class="band-card admin-tile">
		<h3 class="band-card__title admin-tile__title">{{ title }}</h3>
		<slot />
	</component>
</template>

<script setup lang="ts">
	defineProps<{
		title: string;
		/** Makes the whole tile a link. */
		to?: string;
	}>();
</script>
