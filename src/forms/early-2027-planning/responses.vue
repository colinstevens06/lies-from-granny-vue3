<template>
	<section class="form-responses-extra">
		<h3>Song suggestions</h3>
		<ul v-if="suggestions.length" class="form-responses__songs">
			<li v-for="item in suggestions" :key="item.short">{{ item.suggestion }} ({{ item.short }})</li>
		</ul>
		<p v-else class="band-card__meta">No suggestions yet.</p>
	</section>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { Form } from '@models/form';
	import { members } from '@components/band/members';

	const props = defineProps<{ form: Form }>();

	/** Every suggestion, in roster order, tagged with who made it. */
	const suggestions = computed(() =>
		props.form.details.songPitches.flatMap(pitch => {
			const short = members.find(m => m.id === pitch.member)?.short ?? pitch.member;
			return pitch.suggestion ? [{ suggestion: pitch.suggestion, short }] : [];
		})
	);
</script>
