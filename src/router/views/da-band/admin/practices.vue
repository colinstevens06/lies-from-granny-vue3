<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<BandLink to="/da-band/admin" class="inline-block mb-3">&larr; Admin</BandLink>
				<h1 class="font-permanent-marker m-0">Practices</h1>

				<AdminGate>
					<p v-if="band.loadState !== 'ready'" class="band-card m-0 text-xl font-bold">
						{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
					</p>

					<PracticeEditor
						v-else-if="editing"
						:practice="editing === 'new' ? undefined : editing"
						@close="editing = undefined"
					/>

					<BandSection v-else>
						<Button label="+ Add a practice" @click="editing = 'new'" />
						<!-- eslint-disable-next-line vue/no-restricted-html-elements -- a whole card is the click target, not a standard button -->
						<button
							v-for="practice in upcoming"
							:key="practice.id"
							type="button"
							class="band-card align-items-start text-left cursor-pointer"
							@click="editing = practice"
						>
							<span class="text-xl font-bold">{{ formatPracticeDay(practice) }}</span>
							<PracticeStatusBadge :status="practice.status" />
							<span class="text-black-alpha-70">
								{{ formatPracticeTime(practice) }} · {{ practiceLocation(practice) }}
							</span>
						</button>
						<p v-if="!upcoming.length" class="band-card m-0 text-xl font-bold">No upcoming practices.</p>
					</BandSection>
				</AdminGate>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue';
	import Button from 'primevue/button';
	import Layout from '@router/layouts/main.vue';
	import AdminGate from '@components/da-band/admin/admin-gate.vue';
	import BandLink from '@components/da-band/band-link.vue';
	import BandSection from '@components/da-band/band-section.vue';
	import PracticeEditor from '@components/da-band/practices/practice-editor.vue';
	import PracticeStatusBadge from '@components/da-band/practices/practice-status-badge.vue';
	import type { Practice } from '@models/practice';
	import { formatPracticeDay, formatPracticeTime, practiceLocation, upcomingPractices } from '@utils/practices';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	/** The practice being edited, 'new' for an empty editor, or nothing for the list. */
	const editing = ref<Practice | 'new'>();

	const upcoming = computed(() => upcomingPractices(band.practices));
</script>
