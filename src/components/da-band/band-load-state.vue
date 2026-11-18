<template>
	<p v-if="loadState === 'error'" class="band-card m-0 text-xl font-bold">Couldn't load. Refresh to try again.</p>
	<RockHornsLoader v-else />
</template>

<script setup lang="ts">
	import RockHornsLoader from '@components/da-band/rock-horns-loader.vue';
	import type { LoadState } from '@models/load-state';

	// What a /da-band page shows until its data is ready. It always renders: the page decides when (its `v-if` often
	// heads a `v-else-if` chain), and this picks the loader or the error line.
	defineProps<{ loadState: LoadState }>();
</script>
