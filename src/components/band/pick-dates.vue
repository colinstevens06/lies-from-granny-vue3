<template>
	<section class="pick-dates">
		<p class="pick-dates__count">{{ counter }}</p>

		<template v-if="groups.everyoneYes.length || groups.oneShort.length">
			<div v-if="groups.everyoneYes.length" class="pick-dates__group">
				<h3>Everyone said Yes</h3>
				<div class="pick-dates__chips">
					<button
						v-for="day in groups.everyoneYes"
						:key="day"
						type="button"
						class="pick-dates__chip"
						:aria-pressed="picked.includes(day)"
						@click="toggle(day)"
					>
						{{ dayLabel(day) }}
					</button>
				</div>
			</div>

			<div v-if="groups.oneShort.length" class="pick-dates__group">
				<h3>One short</h3>
				<div class="pick-dates__chips">
					<button
						v-for="entry in groups.oneShort"
						:key="entry.day"
						type="button"
						class="pick-dates__chip"
						:aria-pressed="picked.includes(entry.day)"
						@click="toggle(entry.day)"
					>
						{{ dayLabel(entry.day) }}
						<small>no {{ entry.short }}</small>
					</button>
				</div>
			</div>
		</template>
		<p v-else class="band-card__meta">No unbooked dates in this form's range work yet.</p>

		<p v-if="message" class="pick-dates__message">{{ message }}</p>

		<div class="pick-dates__bar">
			<span>{{ picked.length ? picked.map(dayLabel).join(', ') : 'Nothing picked yet' }}</span>
			<Button :label="`Lock in ${picked.length}`" :disabled="!picked.length || locking" @click="lockIn" />
		</div>
	</section>
</template>

<script setup lang="ts">
	import { computed, ref } from 'vue';
	import Button from 'primevue/button';
	import type { Form } from '@models/form';
	import { shows } from '@components/shows/shows';
	import { pickGroups } from '@utils/band-calendar';
	import { BandApiError } from '@utils/band-api';
	import { easternNow, formatCalendarDate } from '@utils/dates';
	import { useBandStore } from '@/stores/band';

	// The admin's lock-in: pick dates, then Lock in creates those practices (time TBD) and closes the form.
	const props = defineProps<{ form: Form }>();

	const band = useBandStore();
	const today = easternNow().slice(0, 10);

	const groups = computed(() => pickGroups(props.form, band.availability, band.practices, today, shows));

	const picked = ref<string[]>([]);
	const message = ref('');
	const locking = ref(false);

	const needed = computed(() => props.form.availability?.practicesNeeded);
	const counter = computed(() =>
		needed.value === undefined ? `${picked.value.length} picked` : `${picked.value.length} of ${needed.value} picked`
	);

	const dayLabel = (day: string) => formatCalendarDate(day, { weekday: 'short', month: 'short', day: 'numeric' });

	const toggle = (day: string) => {
		picked.value = picked.value.includes(day) ? picked.value.filter(d => d !== day) : [...picked.value, day].sort();
	};

	const lockIn = async () => {
		locking.value = true;
		message.value = '';
		try {
			await band.lockInForm(props.form.id, picked.value);
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
