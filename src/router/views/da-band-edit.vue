<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<RouterLink to="/da-band" class="band-link">&larr; Da Band</RouterLink>
				<h1 class="da-band__title">Edit my availability</h1>
				<p class="band-card__meta">Tap a day to change it. Changes save right away.</p>

				<p v-if="band.loadState !== 'ready'" class="band-card band-card__empty">
					{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
				</p>
				<template v-else>
					<MonthGrid :today="today" :form="band.availabilityForm">
						<template #day="{ date, past }">
							<AnswerCell
								:date="date"
								:answer="band.myDays[date]?.answer"
								:disabled="past"
								@change="(day, answer) => band.setMyAnswers([{ date: day, answer }])"
							/>
						</template>
					</MonthGrid>
					<p v-if="band.saveNotice" class="form-signoff__message">{{ band.saveNotice }}</p>
				</template>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { onMounted } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import AnswerCell from '@components/band/forms/answer-cell.vue';
	import MonthGrid from '@components/band/month-grid.vue';
	import { easternNow } from '@utils/dates';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	const today = easternNow().slice(0, 10);
</script>
