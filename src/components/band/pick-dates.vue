<template>
	<section class="flex flex-column gap-3">
		<p class="m-0 font-bold">{{ counter }}</p>

		<template v-if="groups.everyoneYes.length || groups.oneShort.length">
			<div v-if="groups.everyoneYes.length">
				<h3 class="mt-0 mb-2 text-base">Everyone said Yes</h3>
				<SelectButton
					:model-value="pickedIn(everyoneYesDays)"
					:options="everyoneYesDays.map(day => ({ day, label: dayLabel(day) }))"
					option-label="label"
					option-value="day"
					multiple
					class="gap-2"
					:pt="CHIP_PT"
					@update:model-value="setPicked(everyoneYesDays, $event)"
				/>
			</div>

			<div v-if="groups.oneShort.length">
				<h3 class="mt-0 mb-2 text-base">One short</h3>
				<SelectButton
					:model-value="pickedIn(oneShortDays)"
					:options="groups.oneShort.map(entry => ({ day: entry.day, label: dayLabel(entry.day), short: entry.short }))"
					option-label="label"
					option-value="day"
					multiple
					class="gap-2"
					:pt="CHIP_PT"
					@update:model-value="setPicked(oneShortDays, $event)"
				>
					<template #option="{ option }">
						<span>
							{{ option.label }}
							<small class="block text-xs font-normal">no {{ option.short }}</small>
						</span>
					</template>
				</SelectButton>
			</div>
		</template>
		<p v-else class="text-black-alpha-70">No unbooked dates in this form's range work yet.</p>

		<p v-if="message" class="m-0 font-bold text-pink-600">{{ message }}</p>

		<!-- Sticky in normal flow, never fixed, so it can't cover the content. -->
		<div
			class="sticky bottom-0 z-2 flex flex-wrap align-items-center justify-content-between gap-3 p-3 border-top-1 border-black-alpha-10 surface-100"
		>
			<span>{{ chosen.length ? chosen.map(dayLabel).join(', ') : 'Nothing picked yet' }}</span>
			<Button :label="`Lock in ${chosen.length}`" :disabled="!chosen.length || locking" @click="lockIn" />
		</div>
	</section>
</template>

<script setup lang="ts">
	import { computed, ref } from 'vue';
	import Button from 'primevue/button';
	import SelectButton from 'primevue/selectbutton';
	import type { Form } from '@models/form';
	import { shows } from '@components/shows/shows';
	import { pickGroups } from '@utils/band-calendar';
	import { BandApiError } from '@utils/band-api';
	import { easternNow, formatCalendarDate } from '@utils/dates';
	import { useBandStore } from '@/stores/band';

	// The admin's lock-in: pick dates, then Lock in creates those practices (time TBD) and closes the form.
	const props = defineProps<{ form: Form }>();

	// Separate pills, not one joined group.
	const CHIP_PT = { button: { class: 'border-1 border-round-3xl' } };

	const band = useBandStore();
	const today = easternNow().slice(0, 10);

	const groups = computed(() => pickGroups(props.form, band.availability, band.practices, today, shows));

	const picked = ref<string[]>([]);
	const message = ref('');
	const locking = ref(false);

	/** What's picked and still offered. A day that drops out of both lists (a member's answer changed, it got booked) stops counting and is never sent. */
	const chosen = computed(() =>
		picked.value.filter(day => groups.value.everyoneYes.includes(day) || groups.value.oneShort.some(e => e.day === day))
	);

	const needed = computed(() => props.form.availability?.practicesNeeded);
	const counter = computed(() =>
		needed.value === undefined ? `${chosen.value.length} picked` : `${chosen.value.length} of ${needed.value} picked`
	);

	const dayLabel = (day: string) => formatCalendarDate(day, { weekday: 'short', month: 'short', day: 'numeric' });

	const everyoneYesDays = computed(() => groups.value.everyoneYes);
	const oneShortDays = computed(() => groups.value.oneShort.map(entry => entry.day));

	/** The picked days that belong to one list, which is what that list's SelectButton shows. */
	const pickedIn = (days: string[]) => picked.value.filter(day => days.includes(day));

	/** A list changed: swap its days in `picked` and keep the whole thing sorted. */
	const setPicked = (days: string[], value: string[] | null) => {
		picked.value = [...picked.value.filter(day => !days.includes(day)), ...(value ?? [])].sort();
	};

	const lockIn = async () => {
		locking.value = true;
		message.value = '';
		try {
			await band.lockInForm(props.form.id, chosen.value);
			await band.load();
		} catch (error) {
			if (error instanceof BandApiError && error.code === 'already-booked') {
				const taken = (error.details.days as string[] | undefined) ?? [];
				await band.load();
				picked.value = picked.value.filter(day => !taken.includes(day));
				message.value = `Already booked: ${taken.map(dayLabel).join(', ')}`;
			} else if (!(error instanceof BandApiError && error.status === 401)) {
				message.value = "Couldn't lock those in. Try again.";
			}
		} finally {
			locking.value = false;
		}
	};
</script>
