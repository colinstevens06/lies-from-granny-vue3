<template>
	<Layout>
		<div class="main-container">
			<div class="grid mt-3">
				<div class="col-12 md:col-7 flex-order-2 md:flex-order-1">
					<p class="mt-0">
						Need a live band for your upcoming event? Need a band to fill in a spot at your bar? Or to schedule us for
						regular appearances?
					</p>
					<p>We'd love to hear from you.</p>
					<p>
						We'll work with you on selecting songs to fit your party's vibe. Take a look at our
						<router-link to="/songs">song list</router-link>
						for an idea of what we play.
					</p>
					<p>
						Email us at
						<a href="mailto:liesfromgranny@gmail.com">LiesFromGranny@gmail.com</a>
					</p>
					<p>Follow us on social media:</p>
					<ul>
						<li>
							<a href="https://www.instagram.com/liesfromgranny/" target="_blank" rel="noopener noreferrer">
								Instagram
							</a>
						</li>
						<li>
							<a :href="urls.facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
						</li>
					</ul>
				</div>

				<div class="col-12 md:col-5 flex-order-1 md:flex-order-2">
					<img
						src="/images/contact/contact-lies-from-granny.jpg"
						alt="Lies From Granny at Locust Point Festival"
						class="img-fluid"
					/>
				</div>
			</div>
		</div>
	</Layout>
</template>

<script setup lang="ts">
	import Layout from '@router/layouts/main.vue';
	import { urls } from '@utils/urls';
</script>
