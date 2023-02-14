<template>
	<div class="shows-container">
		<template v-for="show in gigs" :key="show.id">
			<ShowCard :gig="show" />
		</template>
	</div>
</template>

<script setup lang="ts">
	import ShowCard from './show-card.vue';
	import type { Gig } from '@models/gig';

	defineProps<{ gigs: Gig[] }>();
</script>
