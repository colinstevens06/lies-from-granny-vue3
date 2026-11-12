<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<RouterLink to="/da-band" class="band-link">&larr; Da Band</RouterLink>

				<p v-if="band.loadState !== 'ready'" class="band-card band-card__empty">
					{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
				</p>
				<p v-else-if="!form || form.closedAt" class="band-card band-card__empty">That form isn't open.</p>
				<p v-else-if="!registered" class="band-card band-card__empty">This form needs an app update.</p>

				<template v-else-if="form && registered">
					<h1 class="da-band__title">{{ form.title }}</h1>
					<p class="form-todo__due" :class="{ 'form-todo__due--overdue': overdueDays > 0 }">{{ dueText }}</p>
					<p class="band-card__meta">Everything saves as you go. Sign off at the bottom when you're done.</p>

					<div class="form-progress">
						<span v-for="line in lines" :key="line.label" :class="{ 'form-progress__line--ok': line.ok }">
							{{ line.label }}: {{ line.value }}
						</span>
					</div>

					<component :is="registered.screen" :form="form" />

					<div class="form-signoff">
						<p v-if="message" class="form-signoff__message">{{ message }}</p>
						<p v-if="signedOff" class="band-card__meta">
							You're signed off. You can still change answers until it closes.
						</p>
						<Button v-else label="Sign off" :disabled="!done || band.saving || signingOff" @click="signOff" />
						<span v-if="band.saveNotice" class="form-signoff__message">{{ band.saveNotice }}</span>
					</div>
				</template>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, nextTick, onMounted, ref } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import Button from 'primevue/button';
	import Layout from '@router/layouts/main.vue';
	import { BandApiError } from '@utils/band-api';
	import { daysBetween, formatCalendarDate } from '@utils/dates';
	import { clientFormFor } from '@/forms';
	import { useFormProgress } from '@/composables/use-form-progress';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	const route = useRoute();
	const router = useRouter();
	onMounted(band.load);

	const form = computed(() => band.forms.find(f => f.id === Number(route.params.id)));
	const registered = computed(() => (form.value ? clientFormFor(form.value.slug) : undefined));
	const signedOff = computed(() => form.value?.members.some(m => m.member === band.me?.member && m.signedOffAt));

	// The progress composable wants a form even before one loads; it's only read once `form` exists.
	const { today, done, lines } = useFormProgress(() => form.value!);

	const overdueDays = computed(() => (form.value ? Math.max(0, daysBetween(form.value.dueDay, today)) : 0));
	const dueText = computed(() =>
		!form.value
			? ''
			: overdueDays.value > 0
			? `Overdue by ${overdueDays.value} ${overdueDays.value === 1 ? 'day' : 'days'}. Shame.`
			: `Due ${formatCalendarDate(form.value.dueDay, { weekday: 'short', month: 'short', day: 'numeric' })}`
	);

	const message = ref('');
	const signingOff = ref(false);

	const signOff = async () => {
		// Rechecked at click time: the rule and the save queue can change between render and tap.
		if (!form.value || !done.value || band.saving) return;

		signingOff.value = true;
		message.value = '';
		try {
			await band.signOffForm(form.value.id);
			await router.push('/da-band');
		} catch (error) {
			if (error instanceof BandApiError && error.code === 'incomplete') {
				await band.load();
				message.value = "Something's still missing.";
				const first = error.details.firstMissing;
				await nextTick();
				if (typeof first === 'string')
					document.querySelector(`[data-day="${first}"]`)?.scrollIntoView({ block: 'center' });
			} else if (error instanceof BandApiError && error.code === 'closed') {
				message.value = 'This form just closed.';
				setTimeout(() => router.push('/da-band'), 1500);
			} else if (!(error instanceof BandApiError && error.status === 401)) {
				message.value = "Couldn't sign off. Try again.";
			}
		} finally {
			signingOff.value = false;
		}
	};
</script>
