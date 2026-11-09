<template>
	<div class="practice-card__time">{{ time }}</div>
	<div class="band-card__meta">
		<i class="pi pi-map-marker"></i>
		{{ location }}
	</div>
	<div v-if="gig" class="band-card__meta">
		<i class="pi pi-star"></i>
		Prepping for {{ gig.name }}, {{ gig.date }}
	</div>
	<details v-if="practice.prepare?.length" class="practice-card__songs" :open="songsOpen">
		<summary>Songs to prepare ({{ practice.prepare.length }})</summary>
		<ul>
			<li v-for="song in practice.prepare" :key="song">{{ song }}</li>
		</ul>
	</details>
	<div v-if="practice.recap?.length">
		<div class="practice-card__label">Recap</div>
		<ul>
			<li v-for="line in practice.recap" :key="line">{{ line }}</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
	import type { Practice } from '@models/practice';
	import { formatPracticeTime, practiceGig, practiceLocation } from '@utils/practices';
	import { computed } from 'vue';

	const props = defineProps<{
		practice: Practice;
		/** Start with the song list expanded. */
		songsOpen?: boolean;
	}>();

	const time = computed(() => formatPracticeTime(props.practice));
	const location = computed(() => practiceLocation(props.practice));
	const gig = computed(() => practiceGig(props.practice));
</script>
