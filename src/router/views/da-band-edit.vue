<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<BandLink to="/da-band" class="inline-block mb-3">&larr; Da Band</BandLink>
				<h1 class="font-permanent-marker m-0">Edit my availability</h1>
				<p class="text-black-alpha-70">Tap a day to change it. Changes save right away.</p>

				<p v-if="band.loadState !== 'ready'" class="band-card m-0 text-xl font-bold">
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
					<p v-if="band.saveNotice" class="m-0 font-bold">{{ band.saveNotice }}</p>
				</template>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { onMounted } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import AnswerCell from '@components/band/forms/answer-cell.vue';
	import BandLink from '@components/band/band-link.vue';
	import MonthGrid from '@components/band/month-grid.vue';
	import { easternNow } from '@utils/dates';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	const today = easternNow().slice(0, 10);
</script>
