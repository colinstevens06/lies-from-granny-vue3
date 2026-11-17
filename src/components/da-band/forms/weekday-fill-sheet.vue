<template>
	<BandDrawer :visible header="Fill a weekday at once" @update:visible="emit('update:visible', $event)">
		<div class="flex align-items-center gap-2 mb-2">
			<InputSwitch v-model="overwrite" input-id="weekday-fill-overwrite" />
			<label for="weekday-fill-overwrite" class="font-bold">Also change days I already answered</label>
		</div>
		<p class="mt-0 mb-3 text-sm text-black-alpha-70">
			{{
				overwrite
					? 'Every remaining day for that weekday gets your answer, including ones you already picked.'
					: "Fills only the days you haven't answered. Anything you picked stays as it is."
			}}
		</p>
		<div v-for="(name, weekday) in WEEKDAY_LABELS" :key="name" class="flex align-items-center gap-2 py-1">
			<span class="w-2rem flex-none font-bold">{{ name }}</span>
			<!-- Nothing stays selected, so tapping the same answer again (after flipping overwrite) still emits. -->
			<!-- Yes / No / Not sure stay on one line at phone width: each option sizes to its label, no wrap. -->
			<SelectButton
				class="flex flex-nowrap flex-1 min-w-0"
				:pt="{ button: { class: 'flex-auto min-w-0 justify-content-center py-2 px-2 text-sm white-space-nowrap' } }"
				:model-value="undefined"
				:options="ANSWER_OPTIONS"
				option-label="label"
				option-value="value"
				:aria-label="`Fill every blank ${name}`"
				@update:model-value="fill(weekday, $event)"
			/>
			<small role="status" class="w-4rem flex-none text-right text-xs line-height-2 text-black-alpha-70">
				{{ status(weekday) }}
			</small>
		</div>
	</BandDrawer>
</template>

<script setup lang="ts">
	import { reactive, ref, watch } from 'vue';
	import InputSwitch from 'primevue/inputswitch';
	import SelectButton from 'primevue/selectbutton';
	import BandDrawer from '@components/da-band/band-drawer.vue';
	import type { Answer } from '@models/availability';
	import { ANSWERS } from '@utils/da-band/availability';
	import { ANSWER_LABEL, WEEKDAY_LABELS } from '@utils/da-band/band-calendar';

	const ANSWER_OPTIONS = ANSWERS.map(answer => ({
		value: answer,
		label: ANSWER_LABEL[answer]
	}));

	const props = defineProps<{
		visible: boolean;
		/** Blank days from today on, per weekday (Sunday = 0). */
		blankCounts: number[];
		/** All days from today on, per weekday, answered or not. */
		dayCounts: number[];
		/** How many days a fill would actually change, so the status never claims more than was sent. */
		countChanges: (weekday: number, answer: Answer, overwrite: boolean) => number;
	}>();

	const emit = defineEmits<{
		'update:visible': [visible: boolean];
		/** `weekday` is 0 (Sunday) to 6. `overwrite` also changes days already answered. */
		fill: [weekday: number, answer: Answer, overwrite: boolean];
	}>();

	// Overwriting has no undo, so it starts off every time the sheet opens.
	const overwrite = ref(false);

	// What the last tap on each weekday did, so the sheet can stay open and still say something happened.
	const last = reactive<Record<number, { answer: Answer; filled: number }>>({});

	watch(
		() => props.visible,
		() => {
			overwrite.value = false;
			Object.keys(last).forEach(key => delete last[Number(key)]);
		}
	);

	// A status from the other mode would sit next to the wrong switch position.
	watch(overwrite, () => Object.keys(last).forEach(key => delete last[Number(key)]));

	const fill = (weekday: number, answer: Answer) => {
		const changed = props.countChanges(weekday, answer, overwrite.value);
		last[weekday] = { answer, filled: changed };
		if (changed > 0) emit('fill', weekday, answer, overwrite.value);
	};

	const status = (weekday: number) => {
		const tapped = last[weekday];
		if (!tapped) return overwrite.value ? `${props.dayCounts[weekday]} days` : `${props.blankCounts[weekday]} blank`;
		if (tapped.filled === 0) return 'Nothing left to fill';
		return `${tapped.filled} ${tapped.filled === 1 ? 'day' : 'days'} filled ✓`;
	};
</script>
