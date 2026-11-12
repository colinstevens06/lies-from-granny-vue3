<template>
	<article class="band-card form-todo" :class="{ 'form-todo--overdue': overdueDays > 0 }">
		<p class="form-todo__kicker">To do</p>
		<h3 class="band-card__title">{{ form.title }}</h3>
		<p class="form-todo__due">{{ dueText }}</p>
		<p v-if="done" class="band-card__meta">Just sign off. Nothing new to fill in.</p>
		<ul class="form-todo__lines">
			<li v-for="line in lines" :key="line.label" :class="{ 'form-todo__line--ok': line.ok }">
				<strong>{{ line.label }}</strong>
				<span>{{ line.value }}</span>
			</li>
		</ul>
		<RouterLink :to="`/da-band/form/${form.id}`" class="p-button form-todo__button">
			{{ done ? 'Check and sign off' : 'Keep going' }}
		</RouterLink>
	</article>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Form } from '@models/form';
	import { daysBetween, formatCalendarDate } from '@utils/dates';
	import { useFormProgress } from '@/composables/use-form-progress';

	const props = defineProps<{ form: Form }>();

	const { today, done, lines } = useFormProgress(() => props.form);

	const overdueDays = computed(() => Math.max(0, daysBetween(props.form.dueDay, today)));
	const dueText = computed(() =>
		overdueDays.value > 0
			? `Overdue by ${overdueDays.value} ${overdueDays.value === 1 ? 'day' : 'days'}. Shame.`
			: `Due ${formatCalendarDate(props.form.dueDay, { weekday: 'short', month: 'short', day: 'numeric' })}`
	);
</script>
