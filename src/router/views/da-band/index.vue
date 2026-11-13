<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<h1 class="font-permanent-marker m-0">Da Band</h1>

				<p v-if="band.loadState !== 'ready'" class="band-card m-0 text-xl font-bold">
					{{ band.loadState === 'error' ? "Couldn't load. Refresh to try again." : 'Loading…' }}
				</p>

				<template v-else>
					<BandSection v-if="band.myTodos.length">
						<FormTodoCard v-for="form in band.myTodos" :key="form.id" :form="form" />
					</BandSection>

					<p
						v-if="band.availabilityForm && band.everyoneIn(band.availabilityForm)"
						class="band-card band-card--featured"
					>
						<strong>Everyone's in.</strong>
						{{ possibleCount }} {{ possibleCount === 1 ? 'date works' : 'dates work' }}. Practice dates are being
						picked. They'll show up here.
					</p>

					<BandSection v-if="band.me?.role === 'admin' && band.openForms.length" title="Forms">
						<FormStatusCard v-for="form in band.openForms" :key="form.id" :form="form" />
					</BandSection>

					<BandSection title="Next practice">
						<PracticeCard v-if="nextPractice" :practice="nextPractice" featured />
						<p v-else class="band-card band-card--featured m-0 text-xl font-bold">No practice on the calendar.</p>
					</BandSection>

					<BandSection title="Next gig">
						<NextGig :gig="nextGig" :today="today" />
					</BandSection>

					<BandSection v-if="band.availabilityForm" title="Possible dates">
						<PossibleDates :form="band.availabilityForm" />
					</BandSection>

					<BandSection title="Band calendar">
						<BandCalendar :today="today" :form="band.availabilityForm" />
						<BandLink to="/da-band/edit">Edit my availability &rarr;</BandLink>
					</BandSection>

					<BandSection v-if="!band.availabilityForm" title="Possible dates">
						<PossibleDates />
					</BandSection>

					<template v-for="form in band.openForms" :key="form.id">
						<BandSection v-if="clientFormFor(form.slug)" :title="`${form.title}: responses`">
							<component :is="clientFormFor(form.slug)!.responses" :form="form" />
						</BandSection>
					</template>

					<BandSection v-if="laterPractices.length" title="Upcoming practices">
						<PracticeCard v-for="practice in laterPractices" :key="practice.id" :practice="practice" />
					</BandSection>

					<BandLink to="/da-band/history" class="inline-block mt-4">Practice history &rarr;</BandLink>
				</template>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, onMounted } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import BandCalendar from '@components/da-band/calendar/band-calendar.vue';
	import BandLink from '@components/da-band/band-link.vue';
	import BandSection from '@components/da-band/band-section.vue';
	import PossibleDates from '@components/da-band/calendar/possible-dates.vue';
	import FormTodoCard from '@components/da-band/forms/form-todo-card.vue';
	import FormStatusCard from '@components/da-band/forms/form-status-card.vue';
	import NextGig from '@components/da-band/next-gig.vue';
	import PracticeCard from '@components/da-band/practices/practice-card.vue';
	import { shows } from '@components/shows/shows';
	import { useEasternNow } from '@/composables/use-eastern-now';
	import { upcomingPractices } from '@utils/practices';
	import { possibleDates } from '@utils/band-calendar';
	import { upcomingShows } from '@utils/shows';
	import { clientFormFor } from '@/forms';
	import { useBandStore } from '@/stores/band';

	const band = useBandStore();
	onMounted(band.load);

	const { now, today } = useEasternNow();

	const upcoming = computed(() => upcomingPractices(band.practices, now.value));
	const nextPractice = computed(() => upcoming.value.find(practice => practice.status !== 'cancelled'));
	const laterPractices = computed(() => upcoming.value.filter(practice => practice !== nextPractice.value));
	const nextGig = upcomingShows(shows)[0];

	const possibleCount = computed(
		() => possibleDates(band.availabilityForm, band.availability, band.practices, shows, today.value).length
	);
</script>
