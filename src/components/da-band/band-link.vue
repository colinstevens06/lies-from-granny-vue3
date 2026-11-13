<template>
	<RouterLink :to="to" class="align-self-start font-bold text-pink-600"><slot /></RouterLink>
</template>

<script setup lang="ts">
	// The /da-band text link ("← Da Band", "Open form →"). Layout around it (inline-block, margins) comes from the caller.
	defineProps<{ to: string }>();
</script>
