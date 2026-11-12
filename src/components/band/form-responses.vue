<template>
	<ul class="form-responses">
		<li v-for="entry in form.members" :key="entry.member" class="form-responses__row">
			<strong>{{ nameOf(entry.member) }}</strong>
			<span class="form-responses__status">{{ entry.signedOffAt ? 'Signed off' : 'Not yet' }}</span>
			<span v-if="total !== undefined" class="form-responses__dates">
				{{ answeredCount(form, rowOf(entry.member)) }} of {{ total }} dates
			</span>
		</li>
	</ul>
</template>

<script setup lang="ts">
	import type { Form } from '@models/form';
	import { members } from '@components/band/members';
	import { answeredCount, rangeDayCount } from '@utils/form-status';
	import { useBandStore } from '@/stores/band';

	const props = defineProps<{ form: Form }>();

	const band = useBandStore();
	const total = rangeDayCount(props.form);

	const nameOf = (id: string) => members.find(m => m.id === id)?.short ?? id;
	const rowOf = (id: string) => band.availability.find(row => row.member === id);
</script>
