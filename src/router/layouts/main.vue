<template>
	<div class="lfg-main">
		<Nav />
		<main class="footer-spacer">
			<slot />
		</main>
		<Footer />
	</div>
</template>

<script setup lang="ts">
	import Nav from '@/components/layout/nav.vue';
	import Footer from '@components/layout/footer.vue';
</script>
