<template>
	<section class="form-responses-extra">
		<h3>New songs</h3>
		<ul v-if="songs.length" class="form-responses__songs">
			<li v-for="song in songs" :key="`${song.short}-${song.title}`">
				{{ song.title }} – {{ song.artist }} ({{ song.short }})
			</li>
		</ul>
		<p v-else class="band-card__meta">No songs yet.</p>
	</section>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Form } from '@models/form';
	import { members } from '@components/band/members';

	const props = defineProps<{ form: Form }>();

	/** Every member's suggestions, in roster order, each tagged with who suggested it. */
	const songs = computed(() =>
		props.form.details.songPitches.flatMap(pitch => {
			const short = members.find(m => m.id === pitch.member)?.short ?? pitch.member;
			return pitch.songs.map(song => ({ ...song, short }));
		})
	);
</script>
