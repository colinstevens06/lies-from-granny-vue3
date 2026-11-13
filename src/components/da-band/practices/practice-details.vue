<template>
	<div class="font-bold" :class="[featured ? 'text-xl' : '', { 'line-through': cancelled }]">{{ time }}</div>
	<div class="text-black-alpha-70">
		<i class="pi pi-map-marker"></i>
		{{ location }}
	</div>
	<div v-if="gig" class="text-black-alpha-70">
		<i class="pi pi-star"></i>
		Prepping for {{ gig.name }}, {{ gig.date }}
	</div>
	<details v-if="practice.prepare?.length" :open="songsOpen">
		<summary class="cursor-pointer font-bold text-pink-600">Songs to prepare ({{ practice.prepare.length }})</summary>
		<ul class="mt-1 mb-0 pl-4">
			<li v-for="song in practice.prepare" :key="song">{{ song }}</li>
		</ul>
	</details>
	<div v-if="practice.recap?.length">
		<div class="font-bold">Recap</div>
		<ul class="mt-1 mb-0 pl-4">
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
		/** The next-practice headline: the time is set larger. */
		featured?: boolean;
	}>();

	const time = computed(() => formatPracticeTime(props.practice));
	const location = computed(() => practiceLocation(props.practice));
	const gig = computed(() => practiceGig(props.practice));
	const cancelled = computed(() => props.practice.status === 'cancelled');
</script>
