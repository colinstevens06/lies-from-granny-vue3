<template>
	<AdminTile :title="form.title" :to="`/da-band/admin/forms/${form.id}`">
		<p v-if="summary" class="band-card__meta">{{ summary }}</p>
		<p class="band-card__meta">Due {{ formatDueDay(form) }}</p>
		<div class="admin-tile__state">
			<span class="admin-pill" :class="{ 'admin-pill--done': form.closedAt }">{{ formStateLabel(form) }}</span>
			<SignedOffDots :form="form" />
		</div>
	</AdminTile>
</template>

<script setup lang="ts">
	import type { Form } from '@models/form';
	import AdminTile from '@components/band/admin-tile.vue';
	import SignedOffDots from '@components/band/signed-off-dots.vue';
	import { availabilitySummary, formatDueDay, formStateLabel } from '@utils/form-status';

	const props = defineProps<{ form: Form }>();

	const summary = availabilitySummary(props.form);
</script>
