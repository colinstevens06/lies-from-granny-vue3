<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<BandLink to="/da-band" class="inline-block mb-3">&larr; Da Band</BandLink>
				<h1 class="font-permanent-marker m-0">Practice history</h1>

				<BandSection>
					<details
						v-for="practice in history"
						:key="practice.id"
						class="band-card block"
						:class="{ 'text-600': practice.status === 'cancelled' }"
					>
						<summary
							class="cursor-pointer text-xl font-bold"
							:class="{ 'line-through': practice.status === 'cancelled' }"
						>
							{{ formatPracticeDay(practice) }}
							<PracticeStatusBadge :status="practice.status" class="ml-2" />
						</summary>
						<div class="flex flex-column gap-1 mt-2">
							<PracticeDetails :practice="practice" songs-open />
						</div>
					</details>
					<p v-if="band.loadState === 'ready' && !history.length" class="band-card m-0 text-xl font-bold">
						No past practices yet.
					</p>
				</BandSection>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import BandLink from '@components/da-band/band-link.vue';
	import BandSection from '@components/da-band/band-section.vue';
	import PracticeDetails from '@components/da-band/practices/practice-details.vue';
	import PracticeStatusBadge from '@components/da-band/practices/practice-status-badge.vue';
	import { formatPracticeDay, practiceHistory } from '@utils/practices';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	const history = computed(() => practiceHistory(band.practices));
</script>
