<template>
	<AdminTile :title="form.title" :to="`/da-band/admin/forms/${form.id}`">
		<p v-if="summary" class="text-black-alpha-70">{{ summary }}</p>
		<p class="text-black-alpha-70">Due {{ formatDueDay(form) }}</p>
		<FormState :form="form" />
	</AdminTile>
</template>

<script setup lang="ts">
	import type { Form } from '@models/form';
	import AdminTile from '@components/da-band/admin/admin-tile.vue';
	import FormState from '@components/da-band/forms/form-state.vue';
	import { clientFormFor } from '@/forms';
	import { availabilitySummary, formatDueDay } from '@utils/form-status';

	const props = defineProps<{ form: Form }>();

	const summary = (clientFormFor(props.form.slug)?.summary ?? availabilitySummary)(props.form);
</script>
