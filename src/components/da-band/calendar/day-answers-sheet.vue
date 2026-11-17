<template>
	<BandDrawer :visible="!!date" :header="title" @update:visible="close">
		<ul v-if="date" class="flex flex-column align-items-center gap-3 m-0 p-0 list-none text-center">
			<li v-for="entry in entries" :key="entry.member.id">
				<strong class="block">{{ entry.member.name }}</strong>
				<span
					v-for="line in entry.lines"
					:key="line.label"
					class="flex align-items-center justify-content-center gap-2"
					:class="`answer-ink--${line.key}`"
				>
					<i class="pi" :class="ANSWER_ICON[line.key]" aria-hidden="true" />
					{{ line.label }}
				</span>
			</li>
		</ul>
		<p v-if="headline" class="mt-4 mb-0 font-bold text-center">{{ headline }}</p>
	</BandDrawer>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import BandDrawer from '@components/da-band/band-drawer.vue';
	import type { MemberAvailability } from '@models/availability';
	import { ANSWER_LABEL, dayAnswers, nearMissText, noGigText } from '@utils/da-band/band-calendar';
	import { formatCalendarDate } from '@utils/dates';
	import { ANSWER_ICON } from './day-status';

	const props = defineProps<{
		/** The day being looked at; undefined keeps the sheet closed. */
		date?: string;
		availability: MemberAvailability[];
	}>();

	const emit = defineEmits<{ close: [] }>();

	const title = computed(() =>
		props.date ? formatCalendarDate(props.date, { weekday: 'long', month: 'long', day: 'numeric' }) : ''
	);
	// A Yes who can't play the show gets two lines, practice green and show pink, like the split dot.
	const entries = computed(() =>
		props.date
			? dayAnswers(props.date, props.availability).map(({ member, answer, noShow }) => ({
					member,
					lines: noShow
						? [
								{ key: 'yes' as const, label: 'Practice: Yes' },
								{ key: 'no' as const, label: 'Show: No' }
						  ]
						: [{ key: answer ?? ('none' as const), label: ANSWER_LABEL[answer ?? 'none'] }]
			  }))
			: []
	);
	const headline = computed(() =>
		props.date ? noGigText(props.date, props.availability) ?? nearMissText(props.date, props.availability) : undefined
	);

	const close = (visible: boolean) => {
		if (!visible) emit('close');
	};
</script>
