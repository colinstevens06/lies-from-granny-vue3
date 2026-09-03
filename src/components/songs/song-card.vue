<template>
	<div class="band-card">
		<div class="text-lg m-0 font-semibold">{{ bandName }}</div>
		<ul class="mt-1 mb-0 list-none pl-0">
			<template v-for="song in songs" :key="song">
				<li class="text-base">{{ song }}</li>
			</template>
		</ul>
	</div>
</template>

<script setup lang="ts">
	defineProps<{ bandName: string; songs: string[] }>();
</script>
