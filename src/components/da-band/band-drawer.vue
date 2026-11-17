<template>
	<Sidebar :visible position="right" :header class="band-drawer" @update:visible="emit('update:visible', $event)">
		<slot />
	</Sidebar>
</template>

<script setup lang="ts">
	import Sidebar from 'primevue/sidebar';

	// The one drawer every /da-band sheet uses: PrimeVue's Sidebar, always opening from the right (Colin, 2026-11-16;
	// bottom sheets looked bad on desktop). A new sheet wraps this, never `Sidebar` directly.
	defineProps<{ visible: boolean; header: string }>();

	const emit = defineEmits<{ 'update:visible': [visible: boolean] }>();
</script>
