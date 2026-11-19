<template>
	<RockHornsLoader v-if="!memberStore.me" />
	<slot v-else-if="memberStore.me.role === 'admin'" />
	<div v-else class="flex flex-column gap-3 mt-4">
		<p class="band-card m-0 text-xl font-bold">Access denied</p>
		<BandLink to="/da-band">&larr; Da Band</BandLink>
	</div>
</template>

<script setup lang="ts">
	import BandLink from '@components/da-band/band-link.vue';
	import RockHornsLoader from '@components/da-band/rock-horns-loader.vue';
	import { useMemberStore } from '@/stores/member';

	// The server is the real gate (every admin endpoint checks the role). This only decides what to show.
	const memberStore = useMemberStore();
</script>
