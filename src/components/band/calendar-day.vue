<template>
	<!-- eslint-disable-next-line vue/no-restricted-html-elements -- a calendar cell with its own status styling and dots, not a standard button -->
	<button
		type="button"
		class="flex flex-column align-items-center justify-content-between py-1 px-0 border-1 border-round-lg"
		:class="[STATUS_CLASS[status], past ? 'opacity-40' : 'cursor-pointer']"
		style="min-height: 3.2rem"
		:disabled="past"
		:aria-label="`${label}: ${STATUS_LABEL[status]}`"
		@click="emit('select', date)"
	>
		<span class="font-bold">{{ Number(date.slice(8)) }}</span>
		<span class="flex" style="gap: 2px">
			<i
				v-for="entry in answers"
				:key="entry.member.id"
				class="inline-block border-circle border-1 answer-dot"
				:class="`answer-dot--${entry.answer ?? 'none'}`"
				style="width: 6px; height: 6px"
			/>
		</span>
	</button>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { MemberAvailability } from '@models/availability';
	import { dayAnswers, type DayStatus } from '@utils/band-calendar';
	import { formatCalendarDate } from '@utils/dates';

	const props = defineProps<{
		date: string;
		status: DayStatus;
		availability: MemberAvailability[];
		past?: boolean;
	}>();

	const emit = defineEmits<{ select: [date: string] }>();

	const STATUS_LABEL: Record<DayStatus, string> = {
		booked: 'booked',
		blocked: 'someone is busy',
		possible: 'everyone is free',
		open: 'open'
	};

	const STATUS_CLASS: Record<DayStatus, string> = {
		booked: 'bg-lfg-pink border-lfg-pink text-white',
		blocked: 'bg-gray-900 border-gray-900 text-white',
		possible: 'bg-poster-yellow border-poster-yellow',
		open: 'bg-white border-black-alpha-20'
	};

	// Five dots, one per member in roster order: green Yes, pink No, orange Not sure, hollow Pending.
	const answers = computed(() => dayAnswers(props.date, props.availability));
	const label = computed(() => formatCalendarDate(props.date, { weekday: 'short', month: 'short', day: 'numeric' }));
</script>
