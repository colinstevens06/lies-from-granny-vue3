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
						<input name="bot-field" class="hidden" />
						<label for="name" class="block mt-3 mb-1">
							Name
							<InputText id="name" name="name" class="mt-1" v-model="formBinding.name" />
						</label>
						<label for="email" class="block mt-3 mb-1">
							Email
							<InputText id="email" name="email" class="mt-1" v-model="formBinding.email" />
						</label>
						<label for="note" class="block mt-3 mb-1">Notes</label>
						<Textarea
							v-model="formBinding.note"
							id="note"
							class="mt-1"
							name="note"
							rows="5"
							placeholder="Let us know what you're looking for!"
						/>
						<Transition name="fade" mode="out-in">
							<p v-if="noteCharLimitExceeded" class="mt-1 text-sm text-red-700">
								{{ charactersAllowedMessage }} You have exceeded that limit. Please shorten your message.
							</p>
							<p v-else class="mt-1 text-sm text-400">
								{{ charactersAllowedMessage }}
								You have {{ charactersLeftNumber }} characters left.
							</p>
						</Transition>
						<Button label="Submit" class="max-w-max mt-2" type="submit" :disabled="!formValid" />
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

	const charactersAllowed = 500;

	const charactersAllowedMessage = `There is a ${charactersAllowed} character limit. `;

	const charactersLeftNumber = computed(() => charactersAllowed - formBinding.note.length);

	const formFilledOut = computed(
		() => formBinding.name.length > 0 && formBinding.email.length > 0 && formBinding.note.length > 0
	);

	const formValid = computed(() => formFilledOut.value && !noteCharLimitExceeded.value);

	const noteCharLimitExceeded = computed(() => formBinding.note.length > charactersAllowed);
</script>
