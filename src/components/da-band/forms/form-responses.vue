<template>
	<ul class="flex flex-column gap-2 m-0 p-0 list-none">
		<li
			v-for="entry in form.members"
			:key="entry.member"
			class="flex flex-wrap column-gap-3 row-gap-1 py-2 px-3 border-1 border-black-alpha-10 border-round-lg bg-white"
		>
			<strong>{{ memberName(entry.member) }}</strong>
			<span class="text-black-alpha-70">{{ entry.signedOffAt ? 'Signed off' : 'Not yet' }}</span>
			<span v-if="total !== undefined">{{ answeredCount(form, rowOf(entry.member)) }} of {{ total }} dates</span>
		</li>
	</ul>
</template>

<script setup lang="ts">
	import type { Form } from '@models/form';
	import { memberName } from '@components/da-band/members';
	import { answeredCount, rangeDayCount } from '@utils/da-band/form-status';
	import { useAvailabilityStore } from '@/stores/availability';

	const props = defineProps<{ form: Form }>();

	const availability = useAvailabilityStore();
	const total = rangeDayCount(props.form);

	const rowOf = (id: string) => availability.availability.find(row => row.member === id);
</script>
