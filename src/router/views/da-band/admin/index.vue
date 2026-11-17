<template>
	<Layout>
		<div class="main-container main-container--flush-mobile">
			<div class="da-band">
				<BandLink to="/da-band" class="inline-block mb-3">&larr; Da Band</BandLink>
				<h1 class="font-permanent-marker m-0">Admin</h1>

				<AdminGate>
					<BandLoadState v-if="loadState === 'error'" :load-state />

					<BandSection title="Forms">
						<AdminFormTile v-for="form in formStore.openForms" :key="form.id" :form />
						<p v-if="loadState === 'ready' && !formStore.openForms.length" class="band-card m-0 text-xl font-bold">
							No form is open.
						</p>
					</BandSection>

					<BandSection v-if="pastForms.length" title="Past forms">
						<AdminFormTile v-for="form in pastForms" :key="form.id" :form />
					</BandSection>

					<BandSection>
						<AdminTile title="Practices" to="/da-band/admin/practices">
							<p class="text-black-alpha-70">{{ nextPracticeLine }}</p>
							<p class="text-black-alpha-70">{{ upcoming.length }} upcoming · {{ needTime }} need a time</p>
						</AdminTile>
					</BandSection>

					<p class="mt-4 mb-0 text-black-alpha-60">More admin tools get their own tile as they're added.</p>
				</AdminGate>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import AdminFormTile from '@components/da-band/admin/admin-form-tile.vue';
	import AdminGate from '@components/da-band/admin/admin-gate.vue';
	import AdminTile from '@components/da-band/admin/admin-tile.vue';
	import BandLink from '@components/da-band/band-link.vue';
	import BandLoadState from '@components/da-band/band-load-state.vue';
	import BandSection from '@components/da-band/band-section.vue';
	import { formatPracticeDay, formatPracticeTime, needsTime, upcomingPractices } from '@utils/da-band/practices';
	import { useEasternNow } from '@/composables/use-eastern-now';
	import { useBandPage } from '@/composables/use-band-page';
	import { useFormStore } from '@/stores/forms';
	import { usePracticeStore } from '@/stores/practices';

	const formStore = useFormStore();
	const practiceStore = usePracticeStore();
	const { loadState } = useBandPage();

	const { now } = useEasternNow();
	const upcoming = computed(() => upcomingPractices(practiceStore.practices, now.value));
	const needTime = computed(() => upcoming.value.filter(needsTime).length);
	const nextPracticeLine = computed(() => {
		const next = upcoming.value.find(practice => practice.status !== 'cancelled');
		return next ? `Next: ${formatPracticeDay(next)}, ${formatPracticeTime(next)}` : 'No practice on the calendar.';
	});

	const pastForms = computed(() => formStore.forms.filter(form => form.closedAt));
</script>
