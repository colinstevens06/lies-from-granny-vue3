<template>
	<div class="flex flex-column gap-5">
		<AvailabilitySection :form="form" :my-days="band.myDays" :today="today" @change="onChange" />

		<YesNoText
			prompt="Would you like to suggest a new song? (optional)"
			label="Song – Artist"
			placeholder="Bangers only"
			:max-length="MAX_SUGGESTION"
			:wants="answer?.wantsNew"
			:text="answer?.suggestion"
			@change="onSong"
		/>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { AvailabilityChange } from '@models/availability';
	import type { Form } from '@models/form';
	import AvailabilitySection from '@components/band/forms/availability-section.vue';
	import YesNoText from '@components/band/forms/yes-no-text.vue';
	import { useFormProgress } from '@/composables/use-form-progress';
	import { useBandStore } from '@/stores/band';
	import type { SongPitch, SongPitchInput } from './model';
	import { MAX_SUGGESTION } from './rules';

	const props = defineProps<{ form: Form }>();

	const band = useBandStore();
	const { today, mine } = useFormProgress(() => props.form);

	/** What to show for the song answer: what's still waiting to save, else what the server has. */
	const answer = computed(
		() => (band.pendingFormAnswer(props.form.id) as SongPitchInput | undefined) ?? (mine.value as SongPitch | undefined)
	);

	const onChange = (changes: AvailabilityChange[], immediate: boolean) =>
		band.setMyAnswers(
			changes.flatMap(({ date, answer: value }) => (value ? [{ date, answer: value }] : [])),
			{ immediate }
		);

	const onSong = ({ wants, text }: { wants: boolean; text: string }) => {
		const body: SongPitchInput = wants ? { wantsNew: true, suggestion: text } : { wantsNew: false };
		band.setMyFormAnswer(props.form.id, body);
	};
</script>
