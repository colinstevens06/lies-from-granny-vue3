<template>
	<fieldset
		class="yes-no flex flex-column gap-3 min-w-0 m-0 p-0 border-none"
		:class="{ 'yes-no--yes': wantsValue === true, 'yes-no--no': wantsValue === false }"
	>
		<legend class="p-0 mb-4 text-xl font-bold">{{ prompt }}</legend>
		<SelectButton
			:model-value="wantsValue"
			:options="CHOICES"
			option-label="label"
			option-value="value"
			:allow-empty="false"
			class="flex w-full"
			:pt="{ button: { class: 'flex-1 justify-content-center py-3 font-bold' } }"
			@update:model-value="choose"
		/>
		<div v-if="wantsValue" class="flex flex-column gap-1">
			<label :for="inputId">{{ label }}</label>
			<InputText
				:id="inputId"
				v-model="textValue"
				class="w-full"
				:placeholder
				:maxlength="maxLength"
				@input="publish"
			/>
			<small v-if="incomplete" class="font-bold text-pink-600">Type the song to sign off, or choose No.</small>
		</div>
	</fieldset>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from 'vue';
	import InputText from 'primevue/inputtext';
	import SelectButton from 'primevue/selectbutton';

	// A yes/no question that starts on No; Yes reveals one text input. It emits only a savable answer: No, or Yes with
	// text. A Yes with an empty box stays here and reports `incomplete`, so the page can hold the sign-off until the
	// member types the song or goes back to No.
	const props = defineProps<{
		prompt: string;
		label: string;
		placeholder?: string;
		maxLength: number;
		/** The saved answer; undefined (nothing saved yet) shows as No. */
		wants?: boolean;
		/** The saved text. */
		text?: string;
	}>();

	const emit = defineEmits<{
		change: [value: { wants: boolean; text: string }];
		/** True while Yes is chosen and the box is empty. */
		'update:incomplete': [incomplete: boolean];
	}>();

	const CHOICES = [
		{ label: 'Yes', value: true },
		{ label: 'No', value: false }
	];

	const inputId = `yes-no-${Math.random().toString(36).slice(2, 8)}`;
	const wantsValue = ref(props.wants ?? false);
	const textValue = ref(props.text ?? '');

	// A refresh (a reload after a refused save, say) changes what's saved. Follow it, but leave the box alone when it
	// only differs by whitespace the member is still typing.
	watch(
		() => [props.wants, props.text] as const,
		([wants, text]) => {
			if ((wants ?? false) !== wantsValue.value) wantsValue.value = wants ?? false;
			if (wants && text !== undefined && text !== textValue.value.trim()) textValue.value = text;
			if (wants === false) textValue.value = '';
		}
	);

	const incomplete = computed(() => wantsValue.value && textValue.value.trim() === '');
	watch(incomplete, value => emit('update:incomplete', value), { immediate: true });

	const publish = () => {
		const text = wantsValue.value ? textValue.value.trim() : '';
		if (wantsValue.value && text === '') return;
		emit('change', { wants: wantsValue.value, text });
	};

	const choose = (value: boolean) => {
		if (value === wantsValue.value) return;
		if (!value && textValue.value.trim() !== '' && !window.confirm('Clear what you typed?')) return;

		wantsValue.value = value;
		if (!value) textValue.value = '';
		publish();
	};
</script>
