<template>
	<article
		class="band-card practice-card"
		:class="{ 'band-card--featured': featured, 'practice-card--cancelled': cancelled }"
	>
		<span v-if="cancelled" class="practice-card__badge">Cancelled</span>
		<div class="band-card__title">{{ day }}</div>
		<div class="practice-card__time">{{ time }}</div>
		<div class="band-card__meta">
			<i class="pi pi-map-marker"></i>
			{{ practice.location }}
		</div>
		<div v-if="gig" class="band-card__meta">
			<i class="pi pi-star"></i>
			Prepping for {{ gig.name }}, {{ gig.date }}
		</div>
		<details v-if="practice.prepare?.length" class="practice-card__songs" :open="featured">
			<summary>Songs to prepare ({{ practice.prepare.length }})</summary>
			<ul>
				<li v-for="song in practice.prepare" :key="song">{{ song }}</li>
			</ul>
		</details>
	</article>
</template>

<script setup lang="ts">
	import type { Practice } from '@models/practice';
	import { formatPracticeDay, formatPracticeTime, practiceGig } from '@utils/practices';
	import { computed } from 'vue';

	const props = defineProps<{
		practice: Practice;
		/** The next-practice headline: larger type, and the song list starts open. */
		featured?: boolean;
	}>();

	const cancelled = computed(() => props.practice.status === 'cancelled');
	const day = computed(() => formatPracticeDay(props.practice));
	const time = computed(() => formatPracticeTime(props.practice));
	const gig = computed(() => practiceGig(props.practice));
</script>
