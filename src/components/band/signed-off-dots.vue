<template>
	<span class="inline-flex gap-1" :aria-label="`${signedOffCount(form)} of ${form.members.length} signed off`">
		<span
			v-for="entry in form.members"
			:key="entry.member"
			class="inline-block w-1rem h-1rem border-circle border-2 border-lfg-pink"
			:class="{ 'bg-lfg-pink': entry.signedOffAt }"
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
