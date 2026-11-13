<template>
	<p v-if="!band.me" class="band-card m-0 text-xl font-bold">Loading…</p>
	<slot v-else-if="band.me.role === 'admin'" />
	<div v-else class="flex flex-column gap-3 mt-4">
		<p class="band-card m-0 text-xl font-bold">Access denied</p>
		<BandLink to="/da-band">&larr; Da Band</BandLink>
	</div>
</template>

<script setup lang="ts">
	import BandLink from '@components/band/band-link.vue';
	import { useBandStore } from '@/stores/band';

	// The server is the real gate (every admin endpoint checks the role). This only decides what to show.
	const band = useBandStore();
</script>
