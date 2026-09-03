<template>
	<footer class="footer surface-900 text-center">
		<div class="footer__socials">
			<a :href="urls.instagram" target="_blank" rel="noopener noreferrer" aria-label="Lies From Granny on Instagram">
				<i class="pi pi-instagram"></i>
			</a>
			<a :href="urls.facebook" target="_blank" rel="noopener noreferrer" aria-label="Lies From Granny on Facebook">
				<i class="pi pi-facebook"></i>
			</a>
		</div>
	</footer>
</template>

<script setup lang="ts">
	import { urls } from '@utils/urls';
</script>
