<template>
	<component :is="to ? 'RouterLink' : 'article'" :to="to" class="band-card no-underline text-900 hover:border-lfg-pink">
		<h3 class="m-0 text-xl font-bold">{{ title }}</h3>
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
