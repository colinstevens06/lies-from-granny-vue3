<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<h1 class="da-band__title">Da Band</h1>

				<p v-if="band.loadState !== 'ready'" class="band-card band-card__empty">
					{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
				</p>

				<section v-if="band.myTodos.length" class="da-band__section">
					<FormTodoCard v-for="form in band.myTodos" :key="form.id" :form="form" />
				</section>

				<p v-if="band.availabilityForm && band.everyoneIn(band.availabilityForm)" class="band-card band-card--featured">
					<strong>Everyone's in.</strong>
					{{ possibleCount }} {{ possibleCount === 1 ? 'date works' : 'dates work' }}. Practice dates are being picked.
					They'll show up here.
				</p>

				<section v-if="band.me?.role === 'admin' && band.openForms.length" class="da-band__section">
					<h2>Forms</h2>
					<FormStatusCard v-for="form in band.openForms" :key="form.id" :form="form" />
				</section>

				<section class="da-band__section">
					<h2>Next practice</h2>
					<PracticeCard v-if="nextPractice" :practice="nextPractice" featured />
					<p v-else class="band-card band-card--featured band-card__empty">No practice on the calendar.</p>
				</section>

				<section class="da-band__section">
					<h2>Next gig</h2>
					<NextGig :gig="nextGig" :today="today" />
				</section>

				<section v-if="band.availabilityForm" class="da-band__section">
					<h2>Possible dates</h2>
					<PossibleDates :form="band.availabilityForm" />
				</section>

				<section class="da-band__section">
					<h2>Band calendar</h2>
					<BandCalendar :today="today" :form="band.availabilityForm" />
					<RouterLink to="/da-band/edit" class="band-link">Edit my availability &rarr;</RouterLink>
				</section>

				<section v-if="!band.availabilityForm" class="da-band__section">
					<h2>Possible dates</h2>
					<PossibleDates />
				</section>

				<template v-for="form in band.openForms" :key="form.id">
					<section v-if="clientFormFor(form.slug)" class="da-band__section">
						<h2>{{ form.title }}: responses</h2>
						<component :is="clientFormFor(form.slug)!.responses" :form="form" />
					</section>
				</template>

				<section v-if="laterPractices.length" class="da-band__section">
					<h2>Upcoming practices</h2>
					<PracticeCard v-for="practice in laterPractices" :key="practice.id" :practice="practice" />
				</section>

				<RouterLink to="/da-band/history" class="band-link">Practice history &rarr;</RouterLink>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import BandCalendar from '@components/band/band-calendar.vue';
	import PossibleDates from '@components/band/possible-dates.vue';
	import FormTodoCard from '@components/band/form-todo-card.vue';
	import FormStatusCard from '@components/band/form-status-card.vue';
	import NextGig from '@components/band/next-gig.vue';
	import PracticeCard from '@components/band/practice-card.vue';
	import { shows } from '@components/shows/shows';
	import { easternNow } from '@utils/dates';
	import { upcomingPractices } from '@utils/practices';
	import { possibleDates } from '@utils/band-calendar';
	import { upcomingShows } from '@utils/shows';
	import { clientFormFor } from '@/forms';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	const now = easternNow();
	const today = now.slice(0, 10);

	const upcoming = computed(() => upcomingPractices(band.practices, now));
	const nextPractice = computed(() => upcoming.value.find(practice => practice.status !== 'cancelled'));
	const laterPractices = computed(() => upcoming.value.filter(practice => practice !== nextPractice.value));
	const nextGig = upcomingShows(shows)[0];

	const possibleCount = computed(
		() => possibleDates(band.availabilityForm, band.availability, band.practices, shows, today).length
	);
</script>
