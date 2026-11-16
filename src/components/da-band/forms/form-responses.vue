<template>
	<ul class="flex flex-column gap-2 m-0 p-0 list-none">
		<li
			v-for="entry in entries"
			:key="entry.member"
			class="flex flex-column gap-1 py-2 px-3 border-1 border-black-alpha-10 border-round-lg bg-white"
		>
			<div class="flex flex-wrap column-gap-3 row-gap-1">
				<strong>{{ memberName(entry.member) }}{{ entry.member === memberStore.me?.member ? ' (you)' : '' }}</strong>
				<span class="text-black-alpha-70">{{ entry.signedOffAt ? 'Signed off' : 'Not yet' }}</span>
				<span v-if="total !== undefined">{{ entry.answered }} of {{ total }} dates</span>
			</div>
			<ProgressBar
				v-if="total"
				:value="Math.round((entry.answered / total) * 100)"
				:show-value="false"
				class="h-1rem"
				:pt="{ value: { class: barColor(entry) } }"
				:aria-label="`${memberName(entry.member)} has answered ${entry.answered} of ${total} dates`"
			/>
		</li>
	</ul>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import ProgressBar from 'primevue/progressbar';
	import type { Form } from '@models/form';
	import { memberName } from '@components/da-band/members';
	import { answeredCount, rangeDayCount } from '@utils/da-band/form-status';
	import { useAvailabilityStore } from '@/stores/availability';
	import { useMemberStore } from '@/stores/member';

	const props = defineProps<{ form: Form }>();

	// One row per member with how far through the form's dates they are, the signed-in member first.
	const availabilityStore = useAvailabilityStore();
	const memberStore = useMemberStore();
	const total = rangeDayCount(props.form);

	// Pink for me, poster yellow for everyone else, green once all the dates are answered.
	const barColor = (entry: { member: string; answered: number }) =>
		entry.answered === total
			? 'bg-answer-yes'
			: entry.member === memberStore.me?.member
			? 'bg-lfg-pink'
			: 'bg-poster-yellow';

	const entries = computed(() =>
		[...props.form.members]
			.sort((a, b) => Number(b.member === memberStore.me?.member) - Number(a.member === memberStore.me?.member))
			.map(entry => ({
				...entry,
				answered: answeredCount(
					props.form,
					availabilityStore.byMember.find(row => row.member === entry.member)
				)
			}))
	);
</script>
