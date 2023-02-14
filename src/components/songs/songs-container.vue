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

	const sortedSongs = ref();

	const sortByName = (input: any) => {
		// verifying input has value
		if (input) {
			let newInput = [...input];

			// alphabatize by band name
			return newInput.sort(function (a, b) {
				if (b.bandName.toLowerCase() < a.bandName.toLowerCase()) {
					return 1;
				} else if (a.bandName.toLowerCase() < b.bandName.toLowerCase()) {
					return -1;
				} else {
					return 0;
				}
			});
		}
	};

	const init = () => {
		sortedSongs.value = sortByName(songs);
	};

	init();
</script>
