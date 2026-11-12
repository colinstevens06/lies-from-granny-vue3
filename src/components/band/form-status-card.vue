<template>
	<article class="band-card form-status-card">
		<h3 class="band-card__title">{{ form.title }}</h3>
		<div class="admin-tile__state">
			<span class="admin-pill">{{ formStateLabel(form) }}</span>
			<SignedOffDots :form="form" />
		</div>
		<p v-if="waiting.length" class="band-card__meta">Waiting on {{ waitingNames }}</p>
		<div class="form-status-card__actions">
			<CopyButton v-if="waiting.length" label="Copy a nudge" :text="nudgeText(form, waiting)" />
			<RouterLink :to="`/da-band/admin/forms/${form.id}`" class="band-link">Open form &rarr;</RouterLink>
		</div>
	</article>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Form } from '@models/form';
	import CopyButton from '@components/band/copy-button.vue';
	import { members } from '@components/band/members';
	import SignedOffDots from '@components/band/signed-off-dots.vue';
	import { formStateLabel, waitingOn } from '@utils/form-status';
	import { nudgeText } from '@utils/band-calendar';

	const props = defineProps<{ form: Form }>();

	const waiting = computed(() => waitingOn(props.form));
	const waitingNames = computed(() =>
		members
			.filter(m => waiting.value.includes(m.id))
			.map(m => m.short)
			.join(', ')
	);
</script>
