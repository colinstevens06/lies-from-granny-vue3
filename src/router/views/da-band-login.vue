<template>
	<Layout>
		<div class="main-container">
			<div class="da-band">
				<h1 class="font-permanent-marker m-0">Da Band</h1>

				<BandSection>
					<template v-if="notAMember">
						<p class="band-card m-0 text-xl font-bold">This account isn't on the band list.</p>
						<Button label="Sign out" severity="secondary" @click="signOutAndStay" />
					</template>
					<template v-else-if="loadFailed">
						<p class="band-card m-0 text-xl font-bold">
							Couldn't reach the server. Check your connection and try again.
						</p>
						<Button label="Try again" @click="router.replace(redirect)" />
					</template>
					<template v-else>
						<DevSignIn v-if="DevSignIn" :redirect="redirect" />
						<Button label="Sign in with Google" icon="pi pi-google" @click="signInWithGoogle(redirect)" />
					</template>
				</BandSection>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import { computed, defineAsyncComponent } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import Button from 'primevue/button';
	import Layout from '@router/layouts/main.vue';
	import BandSection from '@components/band/band-section.vue';
	import { useBandStore } from '@/stores/band';

	// Local testing only. Behind import.meta.env.DEV so the production build drops the component and its import.
	const DevSignIn = import.meta.env.DEV
		? defineAsyncComponent(() => import('@components/band/dev-sign-in.vue'))
		: undefined;

	const route = useRoute();
	const router = useRouter();
	const band = useBandStore();

	const notAMember = computed(() => route.query.reason === 'not-a-member');
	const loadFailed = computed(() => route.query.reason === 'error');
	const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : '/da-band'));

	// auth.ts is lazy: it's only needed once someone presses a button.
	const signInWithGoogle = async (path: string) => (await import('@utils/auth')).signInWithGoogle(path);

	const signOutAndStay = async () => {
		await band.signOut();
		await router.replace({ name: 'da-band-login', query: { redirect: redirect.value } });
	};
</script>
