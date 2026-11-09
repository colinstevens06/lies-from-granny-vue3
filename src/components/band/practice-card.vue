<template>
	<article
		class="band-card practice-card"
		:class="{ 'band-card--featured': featured, 'practice-card--cancelled': practice.status === 'cancelled' }"
	>
		<PracticeStatusBadge :status="practice.status" />
		<div class="band-card__title">{{ formatPracticeDay(practice) }}</div>
		<PracticeDetails :practice="practice" :songs-open="featured" />
	</article>
</template>

<script setup lang="ts">
	import type { Practice } from '@models/practice';
	import PracticeDetails from '@components/band/practice-details.vue';
	import PracticeStatusBadge from '@components/band/practice-status-badge.vue';
	import { formatPracticeDay } from '@utils/practices';

	defineProps<{
		practice: Practice;
		/** The next-practice headline: larger type, and the song list starts open. */
		featured?: boolean;
	}>();
</script>
