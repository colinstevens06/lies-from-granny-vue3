<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<BandLink to="/da-band" class="inline-block mb-3">&larr; Da Band</BandLink>
				<h1 class="font-permanent-marker m-0">Admin</h1>

				<AdminGate>
					<p v-if="band.loadState === 'error'" class="band-card m-0 text-xl font-bold">
						Couldn't load. Refresh to try again.
					</p>

					<BandSection title="Forms">
						<AdminFormTile v-for="form in band.openForms" :key="form.id" :form="form" />
						<p v-if="band.loadState === 'ready' && !band.openForms.length" class="band-card m-0 text-xl font-bold">
							No form is open.
						</p>
					</BandSection>

					<BandSection v-if="pastForms.length" title="Past forms">
						<AdminFormTile v-for="form in pastForms" :key="form.id" :form="form" />
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
	import { computed, onMounted } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import AdminFormTile from '@components/da-band/admin/admin-form-tile.vue';
	import AdminGate from '@components/da-band/admin/admin-gate.vue';
	import AdminTile from '@components/da-band/admin/admin-tile.vue';
	import BandLink from '@components/da-band/band-link.vue';
	import BandSection from '@components/da-band/band-section.vue';
	import { formatPracticeDay, formatPracticeTime, needsTime, upcomingPractices } from '@utils/practices';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	const upcoming = computed(() => upcomingPractices(band.practices));
	const needTime = computed(() => upcoming.value.filter(needsTime).length);
	const nextPracticeLine = computed(() => {
		const next = upcoming.value.find(practice => practice.status !== 'cancelled');
		return next ? `Next: ${formatPracticeDay(next)}, ${formatPracticeTime(next)}` : 'No practice on the calendar.';
	});

	const pastForms = computed(() => band.forms.filter(form => form.closedAt));
</script>
