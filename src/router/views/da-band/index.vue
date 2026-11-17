<template>
	<Layout>
		<div class="main-container main-container--flush-mobile">
			<div class="da-band">
				<h1 class="font-permanent-marker m-0">Da Band</h1>

				<BandLoadState v-if="loadState !== 'ready'" :load-state />

				<template v-else>
					<BandSection v-if="formStore.myTodos.length">
						<FormTodoCard v-for="form in formStore.myTodos" :key="form.id" :form />
					</BandSection>

					<p
						v-if="formStore.availabilityForm && isEveryoneIn(formStore.availabilityForm)"
						class="band-card band-card--featured"
					>
						<strong>Everyone's in.</strong>
						{{ possibleCount }} {{ possibleCount === 1 ? 'date works' : 'dates work' }}. Practice dates are being
						picked. They'll show up here.
					</p>

					<BandSection v-if="memberStore.me?.role === 'admin' && formStore.openForms.length" title="Forms">
						<FormStatusCard v-for="form in formStore.openForms" :key="form.id" :form />
					</BandSection>

					<BandSection title="Next practice">
						<PracticeCard v-if="nextPractice" :practice="nextPractice" featured />
						<p v-else class="band-card band-card--featured m-0 text-xl font-bold">No practice on the calendar.</p>
					</BandSection>

					<BandSection title="Next gig">
						<NextGig :gig="nextGig" :today />
					</BandSection>

					<BandSection v-if="formStore.availabilityForm" title="Possible dates">
						<PossibleDates :form="formStore.availabilityForm" />
					</BandSection>

					<BandSection title="Band calendar">
						<BandCalendar :today :form="formStore.availabilityForm" />
						<BandLink to="/da-band/edit">Edit my availability &rarr;</BandLink>
					</BandSection>

					<BandSection v-if="!formStore.availabilityForm" title="Possible dates">
						<PossibleDates />
					</BandSection>

					<template v-for="form in formStore.openForms" :key="form.id">
						<BandSection v-if="clientFormFor(form.slug)" :title="`${form.title} responses`">
							<FormResponses :form />
							<component :is="clientFormFor(form.slug)!.responses" :form />
						</BandSection>
					</template>

					<BandSection v-if="laterPractices.length" title="Upcoming practices">
						<PracticeCard v-for="practice in laterPractices" :key="practice.id" :practice />
					</BandSection>

					<BandLink v-if="hasHistory" to="/da-band/history" class="inline-block mt-4">Practice history &rarr;</BandLink>
				</template>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import Layout from '@router/layouts/main.vue';
	import BandCalendar from '@components/da-band/calendar/band-calendar.vue';
	import BandLink from '@components/da-band/band-link.vue';
	import BandLoadState from '@components/da-band/band-load-state.vue';
	import BandSection from '@components/da-band/band-section.vue';
	import FormResponses from '@components/da-band/forms/form-responses.vue';
	import PossibleDates from '@components/da-band/calendar/possible-dates.vue';
	import FormTodoCard from '@components/da-band/forms/form-todo-card.vue';
	import FormStatusCard from '@components/da-band/forms/form-status-card.vue';
	import NextGig from '@components/da-band/next-gig.vue';
	import PracticeCard from '@components/da-band/practices/practice-card.vue';
	import { shows } from '@components/shows/shows';
	import { useBandCalendar } from '@/composables/use-band-calendar';
	import { isEveryoneIn } from '@utils/da-band/form-status';
	import { practiceHistory, upcomingPractices } from '@utils/da-band/practices';
	import { nextShowFrom } from '@utils/shows';
	import { clientFormFor } from '@/forms';
	import { useBandPage } from '@/composables/use-band-page';
	import { useFormStore } from '@/stores/forms';
	import { useMemberStore } from '@/stores/member';
	import { usePracticeStore } from '@/stores/practices';

	const memberStore = useMemberStore();
	const formStore = useFormStore();
	const practiceStore = usePracticeStore();
	const { loadState } = useBandPage();

	const { now, today, possibleDates } = useBandCalendar();

	const upcoming = computed(() => upcomingPractices(practiceStore.practices, now.value));
	const nextPractice = computed(() => upcoming.value.find(practice => practice.status !== 'cancelled'));
	const laterPractices = computed(() => upcoming.value.filter(practice => practice !== nextPractice.value));
	const nextGig = computed(() => nextShowFrom(shows, today.value));
	const hasHistory = computed(() => practiceHistory(practiceStore.practices, now.value).length > 0);

	const possibleCount = computed(() => possibleDates(formStore.availabilityForm).length);
</script>
