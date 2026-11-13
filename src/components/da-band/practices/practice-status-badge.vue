<template>
	<span
		v-if="label"
		class="inline-block align-self-start py-1 px-2 border-round-3xl text-white text-xs font-bold line-height-3 uppercase vertical-align-middle"
		:class="status === 'cancelled' ? 'bg-lfg-pink' : 'bg-gray-900'"
	>
		{{ label }}
	</span>
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
