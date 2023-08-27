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
					<form class="p-fluid pr-3 mt-3" name="contact" method="post">
						<input type="hidden" name="form-name" value="contact" />
						<!-- <input name="bot-field" class="hidden" /> -->
						<label for="name" class="block mt-3 mb-1">
							Name
							<InputText id="name" name="name" v-model="formBinding.name" />
							<!-- <input id="name" name="name" type="text" /> -->
						</label>
						<label for="email" class="block mt-3 mb-1">
							Email
							<InputText id="email" name="email" v-model="formBinding.email" />
							<!-- <input id="email" name="email" type="email" /> -->
						</label>
						<label for="note" class="block mt-3 mb-1">Notes</label>
						<!-- <Textarea
							id="note"
							name="note"
							v-model="formBinding.note"
							rows="5"
							placeholder="Let us know what you're looking for!"
						/> -->
						<Button label="Submit" class="max-w-max mt-2" type="submit" />
					</form>
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
	import InputText from 'primevue/inputtext';
	import { computed, reactive } from 'vue';
	import Textarea from 'primevue/textarea';
	import Button from 'primevue/button';

	const formBinding = reactive({
		email: '',
		name: '',
		note: ''
	});

	const formFilledOut = computed(
		() => formBinding.name.length > 0 && formBinding.email.length > 0 && formBinding.note.length > 0
	);
</script>
