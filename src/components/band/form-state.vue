<template>
	<div class="flex flex-wrap align-items-center justify-content-between gap-2 mt-1">
		<span
			class="inline-block py-1 px-2 border-round-3xl text-sm font-bold"
			:class="form.closedAt ? 'bg-black-alpha-10' : 'bg-poster-yellow'"
		>
			{{ formStateLabel(form) }}
		</span>
		<SignedOffDots :form="form" />
	</div>
</template>

<script setup lang="ts">
	import type { Form } from '@models/form';
	import SignedOffDots from '@components/band/signed-off-dots.vue';
	import { formStateLabel } from '@utils/form-status';

	// A form's state pill (Open, Closed, …) with the sign-off dots beside it.
	defineProps<{ form: Form }>();
</script>
