<template>
	<article class="band-card" :class="{ 'band-card--featured': featured, 'text-600': cancelled }">
		<PracticeStatusBadge :status="practice.status" />
		<div
			:class="[
				featured ? 'font-permanent-marker text-3xl font-normal line-height-2' : 'text-xl font-bold',
				{ 'line-through': cancelled }
			]"
		>
			{{ formatPracticeDay(practice) }}
		</div>
		<PracticeDetails :practice="practice" :songs-open="featured" :featured="featured" />
	</article>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Practice } from '@models/practice';
	import PracticeDetails from '@components/band/practice-details.vue';
	import PracticeStatusBadge from '@components/band/practice-status-badge.vue';
	import { formatPracticeDay } from '@utils/practices';

	const props = defineProps<{
		practice: Practice;
		/** The next-practice headline: larger type, and the song list starts open. */
		featured?: boolean;
	}>();

	const cancelled = computed(() => props.practice.status === 'cancelled');
</script>
