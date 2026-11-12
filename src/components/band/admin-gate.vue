<template>
	<p v-if="!band.me" class="band-card band-card__empty">Loading…</p>
	<slot v-else-if="band.me.role === 'admin'" />
	<div v-else class="admin-denied">
		<p class="band-card band-card__empty">Access denied</p>
		<RouterLink to="/da-band" class="band-link">&larr; Da Band</RouterLink>
	</div>
</template>

<script setup lang="ts">
	import { useBandStore } from '@/stores/band';

	// The server is the real gate (every admin endpoint checks the role). This only decides what to show.
	const band = useBandStore();
</script>
