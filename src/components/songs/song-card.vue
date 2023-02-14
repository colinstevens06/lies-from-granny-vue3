<template>
	<div class="band-card">
		<h2 class="text-lg m-0">{{ bandName }}</h2>
		<ul class="mt-2">
			<template v-for="song in songs" :key="song">
				<li>{{ song }}</li>
			</template>
		</ul>
	</div>
</template>

<script setup lang="ts">
	defineProps({ bandName: String, songs: [] });
</script>
