<template>
	<div class="main-container">
		<nav class="flex justify-content-between py-3 top-nav">
			<div class="flex align-items-center">
				<router-link class="top-nav__brand-link flex no-underline" to="/home">
					<img
						src="/images/home/Lies-From-Granny-Logo.png"
						alt="Lies From Granny logo"
						class="top-nav__logo mr-2 md:mr-4"
					/>
					<h1 class="top-nav__brand-name flex m-0" id="brand-header">Lies From Granny</h1>
				</router-link>
			</div>

			<Button
				icon="pi pi-bars"
				class="flex lg:hidden top-nav__hamburger h-min align-self-center"
				@click="toggleMenu"
				type="button"
			/>
			<Menu ref="menu" :model="menuItems" popup />

			<div class="top-nav__nav-links align-items-center hidden lg:flex">
				<router-link class="top-nav__item nav-btn" to="/home" :class="route.name === 'home' && 'top-nav__item--active'">
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
		</nav>
	</div>
</template>

<script setup lang="ts">
	import { useRoute, useRouter } from 'vue-router';
	import Button from 'primevue/button';
	import Menu from 'primevue/menu';
	import { ref } from 'vue';

	const menu = ref();

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

	const toggleMenu = (event: Event) => {
		menu.value.toggle(event);
	};
</script>
