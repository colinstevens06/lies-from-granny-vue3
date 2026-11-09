<template>
	<span v-if="label" class="practice-badge" :class="`practice-badge--${status}`">{{ label }}</span>
</template>

<script setup lang="ts">
	import type { PracticeStatus } from '@models/practice';
	import { computed } from 'vue';

	const props = defineProps<{
		status: PracticeStatus;
	}>();

	/** Only the statuses worth flagging get a badge; scheduled and complete render nothing. */
	const labels: Partial<Record<PracticeStatus, string>> = {
		tentative: 'Tentative',
		cancelled: 'Cancelled'
	};

	const label = computed(() => labels[props.status]);
</script>
