<template>
	<article class="band-card">
		<h3 class="mt-0 text-xl font-bold">{{ form.title }}</h3>
		<FormState :form />
		<p v-if="waiting.length" class="text-black-alpha-70">Waiting on {{ waitingNames }}</p>
		<div class="flex flex-wrap align-items-center gap-3 mt-2">
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
	import BandLink from '@components/da-band/band-link.vue';
	import FormState from '@components/da-band/forms/form-state.vue';
	import { members } from '@components/da-band/members';
	import { isEveryoneIn, waitingOn } from '@utils/da-band/form-status';

	const props = defineProps<{ form: Form }>();

	const waiting = computed(() => waitingOn(props.form));
	const waitingNames = computed(() =>
		members
			.filter(m => waiting.value.includes(m.id))
			.map(m => m.name)
			.join(', ')
	);
</script>
