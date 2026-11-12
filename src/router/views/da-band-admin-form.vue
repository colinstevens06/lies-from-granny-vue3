<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<RouterLink to="/da-band/admin" class="band-link">&larr; Admin</RouterLink>

				<AdminGate>
					<p v-if="band.loadState !== 'ready'" class="band-card band-card__empty">
						{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
					</p>
					<p v-else-if="!form" class="band-card band-card__empty">No such form.</p>

					<template v-else>
						<h1 class="da-band__title">{{ form.title }}</h1>
						<p class="band-card__meta">Due {{ formatDueDay(form) }}</p>
						<div class="admin-tile__state">
							<span class="admin-pill" :class="{ 'admin-pill--done': form.closedAt }">{{ formStateLabel(form) }}</span>
							<SignedOffDots :form="form" />
						</div>

						<section class="da-band__section">
							<template v-if="form.closedAt">
								<h2>Closed</h2>
								<p class="band-card__meta">Closed {{ formatInstantDay(form.closedAt) }}.</p>
								<PracticeCard v-for="practice in formPractices" :key="practice.id" :practice="practice" />
							</template>
							<template v-else>
								<h2>{{ isEveryoneIn(form) ? "Everyone's in" : 'Waiting on answers' }}</h2>
								<div class="form-status-card__actions">
									<CopyButton v-if="waiting.length" label="Copy a nudge" :text="nudgeText(form, waiting)" />
									<Button label="Close form" severity="secondary" @click="confirming = true" />
								</div>
								<p v-if="closeError" class="band-card__meta">{{ closeError }}</p>
							</template>
						</section>

						<section class="da-band__section">
							<h2>Responses</h2>
							<FormResponses :form="form" />
						</section>
					</template>
				</AdminGate>

				<Dialog v-model:visible="confirming" modal header="Close this form?" class="admin-dialog">
					<p>Members won't be able to answer or sign off after it closes.</p>
					<div class="form-status-card__actions">
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
	import AdminGate from '@components/band/admin-gate.vue';
	import CopyButton from '@components/band/copy-button.vue';
	import FormResponses from '@components/band/form-responses.vue';
	import PracticeCard from '@components/band/practice-card.vue';
	import SignedOffDots from '@components/band/signed-off-dots.vue';
	import { nudgeText } from '@utils/band-calendar';
	import { formatDueDay, formatInstantDay, formStateLabel, isEveryoneIn, waitingOn } from '@utils/form-status';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	const route = useRoute();
	onMounted(band.load);

	const form = computed(() => band.forms.find(f => f.id === Number(route.params.id)));
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
