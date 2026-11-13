<template>
	<article class="band-card">
		<h3 class="text-xl font-bold">{{ form.title }}</h3>
		<FormState :form="form" />
		<p v-if="waiting.length" class="text-black-alpha-70">Waiting on {{ waitingNames }}</p>
		<div class="flex flex-wrap align-items-center gap-3 mt-2">
			<CopyButton v-if="waiting.length" label="Copy a nudge" :text="nudgeText(form, waiting)" />
			<RouterLink
				v-if="isEveryoneIn(form) && form.availability"
				:to="`/da-band/admin/forms/${form.id}`"
				class="p-button no-underline align-self-start font-bold"
			>
				Pick practice dates
			</RouterLink>
			<BandLink v-else :to="`/da-band/admin/forms/${form.id}`">Open form &rarr;</BandLink>
		</div>
	</article>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Form } from '@models/form';
	import BandLink from '@components/band/band-link.vue';
	import CopyButton from '@components/band/copy-button.vue';
	import FormState from '@components/band/form-state.vue';
	import { members } from '@components/band/members';
	import { isEveryoneIn, waitingOn } from '@utils/form-status';
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
