<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<RouterLink to="/da-band/admin" class="band-link">&larr; Admin</RouterLink>
				<h1 class="da-band__title">Practices</h1>

				<AdminGate>
					<p v-if="band.loadState !== 'ready'" class="band-card band-card__empty">
						{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
					</p>

					<PracticeEditor
						v-else-if="editing"
						:practice="editing === 'new' ? undefined : editing"
						@close="editing = undefined"
					/>

					<section v-else class="da-band__section">
						<Button label="+ Add a practice" @click="editing = 'new'" />
						<button
							v-for="practice in upcoming"
							:key="practice.id"
							type="button"
							class="band-card practice-row"
							@click="editing = practice"
						>
							<span class="band-card__title">{{ formatPracticeDay(practice) }}</span>
							<PracticeStatusBadge :status="practice.status" />
							<span class="band-card__meta">{{ formatPracticeTime(practice) }} · {{ practiceLocation(practice) }}</span>
						</button>
						<p v-if="!upcoming.length" class="band-card band-card__empty">No upcoming practices.</p>
					</section>
				</AdminGate>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue';
	import Button from 'primevue/button';
	import Layout from '@router/layouts/main.vue';
	import AdminGate from '@components/band/admin-gate.vue';
	import PracticeEditor from '@components/band/practice-editor.vue';
	import PracticeStatusBadge from '@components/band/practice-status-badge.vue';
	import type { Practice } from '@models/practice';
	import { formatPracticeDay, formatPracticeTime, practiceLocation, upcomingPractices } from '@utils/practices';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	/** The practice being edited, 'new' for an empty editor, or nothing for the list. */
	const editing = ref<Practice | 'new'>();

	const upcoming = computed(() => upcomingPractices(band.practices));
</script>
