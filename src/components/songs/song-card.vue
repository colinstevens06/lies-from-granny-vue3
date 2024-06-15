<template>
	<div class="band-card">
		<h2 class="text-lg m-0">{{ bandName }}</h2>
		<ul class="mt-1 mb-0 list-none pl-0">
			<template v-for="song in songs" :key="song">
				<li class="text-sm font-light">{{ song }}</li>
			</template>
		</ul>
	</div>
</template>

<script setup lang="ts">
	defineProps<{ bandName: string; songs: string[] }>();
</script>
