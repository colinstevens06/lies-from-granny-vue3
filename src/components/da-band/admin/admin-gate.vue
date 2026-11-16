<template>
	<p v-if="!member.me" class="band-card m-0 text-xl font-bold">Loading…</p>
	<slot v-else-if="member.me.role === 'admin'" />
	<div v-else class="flex flex-column gap-3 mt-4">
		<p class="band-card m-0 text-xl font-bold">Access denied</p>
		<BandLink to="/da-band">&larr; Da Band</BandLink>
	</div>
</template>

<script setup lang="ts">
	import BandLink from '@components/da-band/band-link.vue';
	import { useMemberStore } from '@/stores/member';

	// The server is the real gate (every admin endpoint checks the role). This only decides what to show.
	const member = useMemberStore();
</script>
