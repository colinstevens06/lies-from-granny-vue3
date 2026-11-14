<template>
	<div class="main-container">
		<nav class="flex justify-content-between py-3 top-nav">
			<div class="flex align-items-center">
				<router-link class="top-nav__brand-link flex no-underline" :to="isBand ? '/' : '/home'">
					<!-- /da-band gets a slim bar: the same logo and name, kept small at every width. -->
					<img
						:src="logoSrc"
						alt="Lies From Granny logo"
						class="top-nav__logo mr-2 md:mr-4"
						:class="{ 'h-3rem': isBand }"
						decoding="async"
					/>
					<h1
						class="top-nav__brand-name flex m-0"
						:class="{ 'text-base md:text-3xl line-height-2': isBand }"
						id="brand-header"
					>
						Lies From Granny
					</h1>
				</router-link>
			</div>

			<template v-if="!isBand">
				<Button
					icon="pi pi-bars"
					class="flex lg:hidden top-nav__hamburger h-min align-self-center"
					@click="toggleMenu"
					type="button"
				/>
				<Menu ref="menu" :model="menuItems" popup />

				<div class="top-nav__nav-links align-items-center hidden lg:flex">
					<router-link
						class="top-nav__item nav-btn"
						to="/home"
						:class="route.name === 'home' && 'top-nav__item--active'"
					>
						<span>Home</span>
					</router-link>

					<router-link
						class="top-nav__item nav-btn"
						to="/shows"
						:class="route.name === 'shows' && 'top-nav__item--active'"
					>
						<span>Shows</span>
					</router-link>

					<router-link
						class="top-nav__item nav-btn"
						to="/songs"
						:class="route.name === 'songs' && 'top-nav__item--active'"
					>
						<span>Songs</span>
					</router-link>

					<router-link
						class="top-nav__item nav-btn"
						to="/contact"
						:class="route.name === 'contact' && 'top-nav__item--active'"
					>
						<span>Contact</span>
					</router-link>
				</div>
			</template>

			<div v-else-if="band.me" class="flex align-items-center gap-3">
				<router-link v-if="band.me.role === 'admin'" class="top-nav__item nav-btn ml-0 py-2 px-3" to="/da-band/admin">
					<span>Admin</span>
				</router-link>
				<p class="align-self-center m-0 text-sm white-space-nowrap">
					{{ signedInName }} &middot;
					<a href="#" @click.prevent="signOutAndLeave">Sign out</a>
				</p>
			</div>
		</nav>
	</div>
</template>

<script setup lang="ts">
	import { useRoute, useRouter } from 'vue-router';
	import Button from 'primevue/button';
	import Menu from 'primevue/menu';
	import { netlifyImage } from '@utils/images';
	import { computed, ref } from 'vue';
	import { members } from '@components/da-band/members';
	import { useBandStore } from '@/stores/band';

	const menu = ref();

	// Logo renders at 40px tall; 80px wide covers 2x displays.
	const logoSrc = netlifyImage('/images/home/Lies-From-Granny-Logo.png', 80);

	const menuItems = ref([
		{
			label: 'Home',
			command: () => {
				router.push({ name: 'home' });
			}
		},
		{
			label: 'Shows',
			command: () => {
				router.push({ name: 'shows' });
			}
		},
		{
			label: 'Songs',
			command: () => {
				router.push({ name: 'songs' });
			}
		},
		{
			label: 'Contact',
			command: () => {
				router.push({ name: 'contact' });
			}
		}
	]);

	const route = useRoute();
	const router = useRouter();
	const band = useBandStore();

	// Every /da-band route gets a slim bar (logo, then the band items) instead of the public site nav.
	const isBand = computed(() => route.path.startsWith('/da-band'));

	const signedInName = computed(() => members.find(m => m.id === band.me?.member)?.name);

	const signOutAndLeave = async () => {
		await band.signOut();
		await router.push({ name: 'da-band-login' });
	};

	const toggleMenu = (event: Event) => {
		menu.value.toggle(event);
	};
</script>
