<template>
	<Sidebar :visible="!!date" position="bottom" :header="title" @update:visible="close">
		<ul v-if="date" class="flex flex-column gap-2 m-0 p-0 list-none">
			<li v-for="entry in dayAnswers(date, availability)" :key="entry.member.id" class="flex justify-content-between">
				<strong>{{ entry.member.short }}</strong>
				<span>{{ ANSWER_LABEL[entry.answer ?? 'none'] }}</span>
			</li>
		</ul>
		<p v-if="nearMiss" class="mt-3 mb-0 font-bold">{{ nearMiss }}</p>
	</Sidebar>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import Sidebar from 'primevue/sidebar';
	import type { MemberAvailability } from '@models/availability';
	import { ANSWER_LABEL, dayAnswers, nearMissText } from '@utils/band-calendar';
	import { formatCalendarDate } from '@utils/dates';

	const props = defineProps<{
		/** The day being looked at; undefined keeps the sheet closed. */
		date?: string;
		availability: MemberAvailability[];
	}>();

	const emit = defineEmits<{ close: [] }>();

	const title = computed(() =>
		props.date ? formatCalendarDate(props.date, { weekday: 'long', month: 'long', day: 'numeric' }) : ''
	);
	const nearMiss = computed(() => (props.date ? nearMissText(props.date, props.availability) : undefined));

	const close = (visible: boolean) => {
		if (!visible) emit('close');
	};
</script>
