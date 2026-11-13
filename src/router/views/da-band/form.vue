<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<BandLink to="/da-band" class="inline-block mb-3">&larr; Da Band</BandLink>

				<p v-if="band.loadState !== 'ready'" class="band-card m-0 text-xl font-bold">
					{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
				</p>
				<p v-else-if="!form || form.closedAt" class="band-card m-0 text-xl font-bold">That form isn't open.</p>
				<p v-else-if="!registered" class="band-card m-0 text-xl font-bold">This form needs an app update.</p>

				<template v-else-if="form && registered">
					<h1 class="font-permanent-marker m-0 text-3xl md:text-5xl">{{ form.title }}</h1>
					<p class="font-bold" :class="{ 'text-lfg-pink': overdueDays > 0 }">{{ dueText }}</p>
					<p class="text-black-alpha-70">Everything saves as you go. Sign off at the bottom when you're done.</p>

					<!-- Sticky in normal flow, never fixed, so the bars can't cover the content. -->
					<div
						class="sticky top-0 z-2 flex flex-wrap column-gap-3 row-gap-1 my-3 py-2 px-3 border-1 border-black-alpha-10 border-round-lg bg-poster-yellow text-sm"
					>
						<span v-for="line in lines" :key="line.label" :class="{ 'text-black-alpha-60': line.ok }">
							{{ line.label }}: {{ line.value }}
						</span>
					</div>

					<component :is="registered.screen" :form="form" />

					<div
						class="sticky bottom-0 z-2 flex flex-wrap align-items-center gap-3 mt-4 p-3 border-top-1 border-black-alpha-10 surface-100"
					>
						<p v-if="message" class="m-0 font-bold">{{ message }}</p>
						<p v-if="signedOff" class="text-black-alpha-70">
							You're signed off. You can still change answers until it closes.
						</p>
						<Button v-else label="Sign off" :disabled="!done || band.saving || signingOff" @click="signOff" />
						<span v-if="band.saveNotice" class="font-bold">{{ band.saveNotice }}</span>
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
	import BandLink from '@components/da-band/band-link.vue';
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

	const overdueDays = computed(() => (form.value ? Math.max(0, daysBetween(form.value.dueDay, today.value)) : 0));
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
