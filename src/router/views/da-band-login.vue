<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<h1 class="da-band__title">Da Band</h1>

				<section class="da-band__section">
					<template v-if="notAMember">
						<p class="band-card band-card__empty">This account isn't on the band list.</p>
						<Button label="Sign out" severity="secondary" @click="signOutAndStay" />
					</template>
					<Button v-else label="Sign in with Google" icon="pi pi-google" @click="signInWithGoogle(redirect)" />
				</section>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import Button from 'primevue/button';
	import Layout from '@router/layouts/main.vue';
	import { useBandStore } from '@/stores/band';

	const route = useRoute();
	const router = useRouter();
	const band = useBandStore();

	const notAMember = computed(() => route.query.reason === 'not-a-member');
	const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : '/da-band'));

	// auth.ts is lazy: it's only needed once someone presses a button.
	const signInWithGoogle = async (path: string) => (await import('@utils/auth')).signInWithGoogle(path);

	const signOutAndStay = async () => {
		await band.signOut();
		await router.replace({ name: 'da-band-login', query: { redirect: redirect.value } });
	};
</script>
