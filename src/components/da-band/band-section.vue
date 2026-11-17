<template>
	<section class="flex flex-column gap-3 mt-4">
		<h2 v-if="title" class="m-0">{{ title }}</h2>
		<slot />
	</section>
</template>

<script setup lang="ts">
	// One block of a /da-band page: an optional heading, then its content a clear gap apart.
	defineProps<{ title?: string }>();
</script>
