<template>
	<section class="band-card">
		<h2 class="text-xl font-bold">Local testing</h2>
		<p class="text-black-alpha-70">Google sign-in only works on the deployed site. Pick a member to test as.</p>
		<div class="flex flex-wrap align-items-center gap-3 mt-2">
			<Button
				v-for="member in members"
				:key="member.id"
				:label="`Sign in as ${member.name}${member.id === 'colin' ? ' (admin)' : ''}`"
				severity="secondary"
				@click="signInAs(member.id)"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
	import Button from 'primevue/button';
	import type { MemberId } from '@models/band-member';
	import { members } from '@components/da-band/members';
	import { setDevMember } from '@utils/dev-auth';

	const props = defineProps<{ redirect: string }>();

	// A full page load, so nothing from a previously chosen member is left in the store.
	const signInAs = (member: MemberId) => {
		setDevMember(member);
		window.location.assign(props.redirect);
	};
</script>
