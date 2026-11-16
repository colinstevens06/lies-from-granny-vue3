<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<BandLink to="/da-band" class="inline-block mb-3">&larr; Da Band</BandLink>
				<h1 class="font-permanent-marker m-0">Edit my availability</h1>
				<p class="text-black-alpha-70">Tap a day to change it. Changes save right away.</p>

				<BandLoadState v-if="loadState !== 'ready'" :load-state />
				<template v-else>
					<MonthGrid :today :form="band.availabilityForm">
						<template #day="{ date, past }">
							<AnswerCell
								:date
								:answer="band.myDays[date]?.answer"
								:show-answer="band.myDays[date]?.showAnswer"
								:disabled="past"
								@change="change => band.setMyAnswers([change])"
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
	import MonthGrid from '@components/da-band/calendar/month-grid.vue';
	import { useEasternNow } from '@/composables/use-eastern-now';
	import { useBandPage } from '@/composables/use-band-page';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	const { loadState, saveNotice } = useBandPage();

	const { today } = useEasternNow();
</script>
