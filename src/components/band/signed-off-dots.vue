<template>
	<span class="signed-off-dots" :aria-label="`${signedOffCount(form)} of ${form.members.length} signed off`">
		<span
			v-for="entry in form.members"
			:key="entry.member"
			class="signed-off-dots__dot"
			:class="{ 'signed-off-dots__dot--on': entry.signedOffAt }"
			:title="`${nameOf(entry.member)}: ${entry.signedOffAt ? 'signed off' : 'not yet'}`"
		/>
	</span>
</template>

<script setup lang="ts">
	import type { Form } from '@models/form';
	import { members } from '@components/band/members';
	import { signedOffCount } from '@utils/form-status';

	defineProps<{ form: Form }>();

	const nameOf = (id: string) => members.find(m => m.id === id)?.short ?? id;
</script>
