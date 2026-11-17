<template>
	<Layout>
		<div class="main-container main-container--flush-mobile">
			<div class="da-band">
				<BandLink to="/da-band" class="inline-block mb-3">&larr; Da Band</BandLink>
				<h1 class="font-permanent-marker m-0">Edit my availability</h1>
				<p class="text-black-alpha-70">Tap a day to change it. Changes save right away.</p>

				<BandLoadState v-if="loadState !== 'ready'" :load-state />
				<template v-else>
					<LegendKeys :items="ANSWER_LEGEND" class="mb-2" />
					<MonthGrid :today :form="formStore.availabilityForm">
						<template #day="{ date, past }">
							<AnswerCell
								:date
								:answer="availabilityStore.myDays[date]?.answer"
								:show-answer="availabilityStore.myDays[date]?.showAnswer"
								:disabled="past"
								@change="change => availabilityStore.setMyAnswers([change])"
							/>
						</template>
					</MonthGrid>
					<p v-if="saveNotice" class="m-0 font-bold">{{ saveNotice }}</p>
				</template>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '@router/layouts/main.vue';
	import AnswerCell from '@components/da-band/forms/answer-cell.vue';
	import BandLink from '@components/da-band/band-link.vue';
	import BandLoadState from '@components/da-band/band-load-state.vue';
	import LegendKeys from '@components/da-band/legend-keys.vue';
	import { ANSWER_LEGEND } from '@components/da-band/forms/answer-legend';
	import MonthGrid from '@components/da-band/calendar/month-grid.vue';
	import { useEasternNow } from '@/composables/use-eastern-now';
	import { useBandPage } from '@/composables/use-band-page';
	import { useAvailabilityStore } from '@/stores/availability';
	import { useFormStore } from '@/stores/forms';

	const availabilityStore = useAvailabilityStore();
	const formStore = useFormStore();
	const { loadState, saveNotice } = useBandPage();

	const { today } = useEasternNow();
</script>
