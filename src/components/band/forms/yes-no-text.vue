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
				:placeholder="placeholder"
				:maxlength="maxLength"
				@input="publish"
			/>
			<small v-if="textValue.trim() === ''" class="font-bold text-pink-600">
				Song is required when Yes is selected.
			</small>
		</div>
	</fieldset>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import InputText from 'primevue/inputtext';
	import SelectButton from 'primevue/selectbutton';

	// A yes/no question; Yes reveals one text input. It emits only a savable answer: No, or Yes with text. A Yes with
	// an empty box stays here until something is typed, so a blank Yes never reaches the server.
	const props = defineProps<{
		prompt: string;
		label: string;
		placeholder?: string;
		maxLength: number;
		/** The saved answer: undefined until chosen. */
		wants?: boolean;
		/** The saved text. */
		text?: string;
	}>();

	const emit = defineEmits<{
		change: [value: { wants: boolean; text: string }];
	}>();

	const CHOICES = [
		{ label: 'Yes', value: true },
		{ label: 'No', value: false }
	];

	const inputId = `yes-no-${Math.random().toString(36).slice(2, 8)}`;
	const wantsValue = ref(props.wants);
	const textValue = ref(props.text ?? '');

	const publish = () => {
		if (wantsValue.value === undefined) return;
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
