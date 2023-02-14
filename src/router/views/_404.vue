<template>
	<Layout>
		<div class="text-center mt-3">
			<h1>404</h1>
			<p>No page matches this route.</p>
			<router-link to="home">Go Back To Home</router-link>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '../layouts/main.vue';
</script>
