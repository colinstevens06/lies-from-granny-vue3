<template>
	<article class="band-card" :class="overdue ? 'bg-lfg-pink text-white' : 'form-todo border-2 border-lfg-pink'">
		<p
			class="m-0 text-xs font-bold uppercase"
			style="letter-spacing: 0.06em"
			:class="overdue ? 'text-white-alpha-90' : 'text-pink-600'"
		>
			To do
		</p>
		<h3 class="text-xl font-bold">{{ form.title }}</h3>
		<p class="m-0 font-bold" :class="overdue ? 'text-white-alpha-90' : ''">{{ dueText }}</p>
		<p v-if="done" :class="overdue ? 'text-white' : 'text-black-alpha-70'">Just sign off. Nothing new to fill in.</p>
		<ul class="flex flex-column gap-2 my-1 p-0 list-none">
			<li
				v-for="line in lines"
				:key="line.label"
				class="flex flex-wrap align-items-baseline column-gap-3 row-gap-1 py-1 px-2 border-round text-sm"
				:class="overdue ? 'bg-white-alpha-20' : 'bg-white-alpha-70'"
			>
				<strong>{{ line.label }}</strong>
				<span :class="overdue ? 'text-white' : line.ok ? 'text-green-700 font-bold' : 'text-black-alpha-60'">
					{{ line.value }}
				</span>
			</li>
		</ul>
		<RouterLink
			:to="`/da-band/form/${form.id}`"
			class="p-button no-underline align-self-start font-bold"
			:class="overdue ? 'bg-white text-pink-600' : ''"
		>
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

	const overdueDays = computed(() => Math.max(0, daysBetween(props.form.dueDay, today.value)));
	const overdue = computed(() => overdueDays.value > 0);
	const dueText = computed(() =>
		overdue.value
			? `Overdue by ${overdueDays.value} ${overdueDays.value === 1 ? 'day' : 'days'}. Shame.`
			: `Due ${formatCalendarDate(props.form.dueDay, { weekday: 'short', month: 'short', day: 'numeric' })}`
	);
</script>
