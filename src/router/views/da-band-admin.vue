<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<RouterLink to="/da-band" class="band-link">&larr; Da Band</RouterLink>
				<h1 class="da-band__title">Admin</h1>

				<AdminGate>
					<p v-if="band.loadState === 'error'" class="band-card band-card__empty">
						Couldn't load. Refresh to try again.
					</p>

					<section class="da-band__section">
						<h2>Forms</h2>
						<AdminFormTile v-for="form in band.openForms" :key="form.id" :form="form" />
						<p v-if="band.loadState === 'ready' && !band.openForms.length" class="band-card band-card__empty">
							No form is open.
						</p>
					</section>

					<section v-if="pastForms.length" class="da-band__section">
						<h2>Past forms</h2>
						<AdminFormTile v-for="form in pastForms" :key="form.id" :form="form" />
					</section>

					<section class="da-band__section">
						<AdminTile title="Practices" to="/da-band/admin/practices">
							<p class="band-card__meta">{{ nextPracticeLine }}</p>
							<p class="band-card__meta">{{ upcoming.length }} upcoming · {{ needTime }} need a time</p>
						</AdminTile>
					</section>

					<p class="admin-note">More admin tools get their own tile as they're added.</p>
				</AdminGate>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import AdminFormTile from '@components/band/admin-form-tile.vue';
	import AdminGate from '@components/band/admin-gate.vue';
	import AdminTile from '@components/band/admin-tile.vue';
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
