<template>
	<div class="songs-container mt-3">
		<template v-for="song in sortedSongs" :key="song.id">
			<SongCard :band-name="song.bandName" :songs="song.songs" />
		</template>
	</div>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import SongCard from './song-card.vue';
	import { songs } from './songs';
	import type { BandListing } from '@models/song';

	const sortedSongs = ref<BandListing[]>();

	const sortByName = (input: BandListing[]) => {
		// verifying input has value
		if (input) {
			let newInput = [...input];

			// alphabatize by band name
			return newInput
				.sort((a, b) => a.bandName.localeCompare(b.bandName.toLowerCase()))
				.map(listing => ({ ...listing, songs: listing.songs.sort() }));
		}
	};

	const init = () => {
		sortedSongs.value = sortByName(songs);
	};

	init();
</script>
