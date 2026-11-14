<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<BandLink to="/da-band/admin" class="inline-block mb-3">&larr; Admin</BandLink>

				<AdminGate>
					<p v-if="band.loadState !== 'ready'" class="band-card m-0 text-xl font-bold">
						{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
					</p>
					<p v-else-if="!form" class="band-card m-0 text-xl font-bold">No such form.</p>

					<template v-else>
						<h1 class="font-permanent-marker m-0">{{ form.title }}</h1>
						<p class="text-black-alpha-70">Due {{ formatDueDay(form) }}</p>
						<FormState :form="form" />

						<BandSection>
							<template v-if="form.closedAt">
								<h2 class="m-0">Closed</h2>
								<p class="text-black-alpha-70">Closed {{ formatInstantDay(form.closedAt) }}.</p>
								<PracticeCard v-for="practice in formPractices" :key="practice.id" :practice="practice" />
							</template>
							<template v-else>
								<h2 class="m-0">{{ isEveryoneIn(form) ? "Everyone's in" : 'Waiting on answers' }}</h2>
								<PickDates v-if="isEveryoneIn(form) && form.availability" :form="form" />
								<div class="flex flex-wrap align-items-center gap-3 mt-2">
									<CopyButton v-if="waiting.length" label="Copy a nudge" :text="nudgeText(form, waiting)" />
									<Button label="Close form" severity="secondary" @click="confirming = true" />
								</div>
								<p v-if="closeError" class="text-black-alpha-70">{{ closeError }}</p>
							</template>
						</BandSection>

						<BandSection title="Responses">
							<FormResponses :form="form" />
							<component :is="registered.responses" v-if="registered" :form="form" />
						</BandSection>

						<BandSection v-if="registered" title="What this form asks">
							<ul class="m-0 pl-4">
								<li v-for="ask in registered.asks(form)" :key="ask">{{ ask }}</li>
							</ul>
						</BandSection>
					</template>
				</AdminGate>

				<Dialog v-model:visible="confirming" modal header="Close this form?">
					<p>Members won't be able to answer or sign off after it closes.</p>
					<div class="flex flex-wrap align-items-center gap-3 mt-2">
						<Button label="Close form" :disabled="closing" @click="closeIt" />
						<Button label="Keep it open" severity="secondary" @click="confirming = false" />
					</div>
				</Dialog>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue';
	import { useRoute } from 'vue-router';
	import Button from 'primevue/button';
	import Dialog from 'primevue/dialog';
	import Layout from '@router/layouts/main.vue';
	import AdminGate from '@components/da-band/admin/admin-gate.vue';
	import BandLink from '@components/da-band/band-link.vue';
	import BandSection from '@components/da-band/band-section.vue';
	import CopyButton from '@components/da-band/copy-button.vue';
	import FormResponses from '@components/da-band/forms/form-responses.vue';
	import FormState from '@components/da-band/forms/form-state.vue';
	import PickDates from '@components/da-band/calendar/pick-dates.vue';
	import PracticeCard from '@components/da-band/practices/practice-card.vue';
	import { clientFormFor } from '@/forms';
	import { nudgeText } from '@utils/band-calendar';
	import { formatDueDay, formatInstantDay, isEveryoneIn, waitingOn } from '@utils/form-status';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	const route = useRoute();
	onMounted(band.load);

	const form = computed(() => band.forms.find(f => f.id === Number(route.params.id)));
	const registered = computed(() => (form.value ? clientFormFor(form.value.slug) : undefined));
	const waiting = computed(() => (form.value ? waitingOn(form.value) : []));
	const formPractices = computed(() => band.practices.filter(p => p.formId === form.value?.id));

	const confirming = ref(false);
	const closing = ref(false);
	const closeError = ref('');

	const closeIt = async () => {
		if (!form.value) return;

		closing.value = true;
		closeError.value = '';
		try {
			await band.closeForm(form.value.id);
		} catch {
			closeError.value = "Couldn't close it. Try again.";
		} finally {
			closing.value = false;
			confirming.value = false;
		}
	};
</script>
