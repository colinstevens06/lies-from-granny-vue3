<template>
	<div class="splash-page splash-page__container text-center">
		<div class="splash-page__content">
			<h1 class="font-permanent-marker text-6xl mt-0 mb-1">See Us Soon</h1>
			<img src="/images/zombie-head.png" class="splash-page__hero-image" />
			<p class="text-xl mb-1">8x10 &#183; March 31, 2023</p>
			<ul class="list-none pl-0 mb-5 mt-1">
				<li class="text-4xl font-permanent-marker">Lies From Granny</li>
				<li class="text-xl">5 Spot &#183; Tom Curran</li>
			</ul>

			<ul class="list-none pl-0 text-base md:inline-flex md:justify-content-between splash-page__links">
				<li class="mb-2">
					<i class="pi pi-ticket mr-1" />
					<!-- prettier-ignore -->
					<a href="https://dice.fm/partner/consensual-reality-llc-dba-the-8x10/event/vb777-lies-from-granny-w-5-spot-and-tom-curran-31st-mar-the-8x10-baltimore-tickets" target="_blank">Buy Tickets</a>
				</li>
				<li class="mb-2">
					<i class="pi pi-list mr-1" />
					<a href="https://fb.me/e/2vPhI0nIf" target="_blank">Event Details</a>
				</li>
				<li>
					<i class="pi pi-home mr-1" />
					<router-link to="home">Continue to home page</router-link>
				</li>
			</ul>
			<!-- <p class="text-xl">&#183;</p> -->
		</div>
	</div>
</template>

<script setup lang="ts"></script>
