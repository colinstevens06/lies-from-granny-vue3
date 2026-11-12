<template>
	<Sidebar :visible="!!date" position="bottom" :header="title" class="day-answers" @update:visible="close">
		<ul v-if="date" class="day-answers__list">
			<li v-for="entry in dayAnswers(date, availability)" :key="entry.member.id">
				<strong>{{ entry.member.short }}</strong>
				<span>{{ ANSWER_LABEL[entry.answer ?? 'none'] }}</span>
			</li>
		</ul>
		<p v-if="nearMiss" class="day-answers__near">{{ nearMiss }}</p>
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
