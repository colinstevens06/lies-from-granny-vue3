<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<RouterLink to="/da-band" class="band-link">&larr; Da Band</RouterLink>
				<h1 class="da-band__title">Practice history</h1>

				<section class="da-band__section">
					<details
						v-for="practice in history"
						:key="practice.id"
						class="band-card practice-history"
						:class="{ 'practice-card--cancelled': practice.status === 'cancelled' }"
					>
						<summary class="band-card__title">
							{{ formatPracticeDay(practice) }}
							<PracticeStatusBadge :status="practice.status" />
						</summary>
						<div class="practice-history__body">
							<PracticeDetails :practice="practice" songs-open />
						</div>
					</details>
					<p v-if="!history.length" class="band-card band-card__empty">No past practices yet.</p>
				</section>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '@router/layouts/main.vue';
	import PracticeDetails from '@components/band/practice-details.vue';
	import PracticeStatusBadge from '@components/band/practice-status-badge.vue';
	import { practices } from '@components/band/practices';
	import { formatPracticeDay, practiceHistory } from '@utils/practices';

	const history = practiceHistory(practices);
</script>
