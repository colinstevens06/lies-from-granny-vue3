<template>
	<p class="band-card m-0 text-xl font-bold">
		{{ loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
	</p>
</template>

<script setup lang="ts">
	import type { LoadState } from '@models/load-state';

	// What a /da-band page shows until its data is ready. It always renders: the page decides when (its `v-if` often
	// heads a `v-else-if` chain), and this only picks the words.
	defineProps<{ loadState: LoadState }>();
</script>
