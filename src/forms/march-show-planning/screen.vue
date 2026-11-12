<template>
	<div class="form-screen">
		<AvailabilitySection :form="form" :my-days="band.myDays" :today="today" @change="onChange" />

		<YesNoRows
			:prompt="`Add new songs for ${targetName(form)}?`"
			:fields="['Song', 'Band']"
			allow-several
			:wants="answer?.wantsNew"
			:rows="answer?.songs.map(song => [song.title, song.artist])"
			:draft="draft"
			@change="onSongs"
			@update:draft="onDraft"
		/>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import type { AvailabilityChange } from '@models/availability';
	import type { Form } from '@models/form';
	import AvailabilitySection from '@components/band/forms/availability-section.vue';
	import YesNoRows from '@components/band/forms/yes-no-rows.vue';
	import { useFormProgress } from '@/composables/use-form-progress';
	import { useBandStore } from '@/stores/band';
	import { targetName } from './index';
	import type { SongPitchInput } from './model';

	const props = defineProps<{ form: Form }>();

	const band = useBandStore();
	const { today, mine } = useFormProgress(() => props.form);

	/** What to show for the songs answer: what's still waiting to save, else what the server has. */
	const answer = computed(() => {
		const pending = band.pendingFormAnswer(props.form.id) as SongPitchInput | undefined;
		if (pending) return { wantsNew: pending.wantsNew, songs: pending.songs ?? [] };

		const saved = mine.value as { wantsNew: boolean; songs: { title: string; artist: string }[] } | undefined;
		return saved && { wantsNew: saved.wantsNew, songs: saved.songs };
	});

	const draft = computed(() => (band.drafts[props.form.id] as string[][] | undefined) ?? []);

	const onChange = (changes: AvailabilityChange[], immediate: boolean) =>
		band.setMyAnswers(
			changes.flatMap(({ date, answer: value }) => (value ? [{ date, answer: value }] : [])),
			{ immediate }
		);

	const onSongs = ({ wants, rows }: { wants: boolean; rows: string[][] }) => {
		const body: SongPitchInput = { wantsNew: wants, songs: rows.map(([title, artist]) => ({ title, artist })) };
		band.setMyFormAnswer(props.form.id, body);
	};

	const onDraft = (rows: string[][]) =>
		rows.length ? band.setDraft(props.form.id, rows) : band.clearDraft(props.form.id);
</script>
