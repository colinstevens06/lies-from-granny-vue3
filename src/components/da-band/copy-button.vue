<template>
	<Button
		:label="copied ? 'Copied' : label"
		:icon="copied ? 'pi pi-check' : 'pi pi-copy'"
		severity="secondary"
		@click="copy"
	/>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import Button from 'primevue/button';

	const props = defineProps<{
		label: string;
		/** The text put on the clipboard. */
		text: string;
	}>();

	const copied = ref(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(props.text);
			copied.value = true;
			setTimeout(() => (copied.value = false), 2000);
		} catch {
			// Clipboard access can be refused; the button just stays as it was.
		}
	};
</script>
