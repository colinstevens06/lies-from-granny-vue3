<template>
	<!-- PrimeVue's default 25rem toast is wider than a phone; under 576px it spans the screen with a 1rem gutter. -->
	<Toast :group="SAVE_TOAST_GROUP" :breakpoints="{ '576px': { width: 'auto', left: '1rem', right: '1rem' } }" />
</template>

<script setup lang="ts">
	import Toast from 'primevue/toast';
	import { SAVE_TOAST_GROUP, useSaveToast } from '@/composables/use-save-toast';

	// The autosave's status for a page that saves as you tap: "Saved" once a burst of changes lands, or why it didn't.
	useSaveToast();
</script>
