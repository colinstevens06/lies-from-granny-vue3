<template>
	<div class="flex flex-column gap-5">
		<AvailabilitySection :form :my-days="myDays" :today @change="onChange" />

		<YesNoText
			prompt="Would you like to suggest a new song?"
			label="Song – Artist"
			placeholder="Bangers only"
			:max-length="MAX_SUGGESTION"
			:wants="answer?.wantsNew"
			:text="answer?.suggestion"
			@change="onSong"
			@update:incomplete="emit('blocking', $event ? 'Type the song or choose No to sign off.' : undefined)"
		/>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { MyAnswer } from '@models/availability';
	import type { Form } from '@models/form';
	import AvailabilitySection from '@components/da-band/forms/availability-section.vue';
	import YesNoText from '@components/da-band/forms/yes-no-text.vue';
	import { useFormProgress } from '@/composables/use-form-progress';
	import type { SongPitch, SongPitchInput } from './model';
	import { MAX_SUGGESTION } from './rules';

	const props = defineProps<{ form: Form }>();

	// `blocking` carries why the member can't sign off yet, beyond what the shared rule knows: a Yes with no song typed.
	const emit = defineEmits<{ blocking: [reason?: string] }>();

	const { today, mine, myDays, setMyAnswers, setMyFormAnswer, pendingFormAnswer } = useFormProgress(() => props.form);

	/** What to show for the song answer: what's still waiting to save, else what the server has. */
	const answer = computed(
		() => (pendingFormAnswer() as SongPitchInput | undefined) ?? (mine.value as SongPitch | undefined)
	);

	const onChange = (changes: MyAnswer[], immediate: boolean) => setMyAnswers(changes, { immediate });

	const onSong = ({ wants, text }: { wants: boolean; text: string }) => {
		const body: SongPitchInput = wants ? { wantsNew: true, suggestion: text } : { wantsNew: false };
		setMyFormAnswer(body);
	};
</script>
