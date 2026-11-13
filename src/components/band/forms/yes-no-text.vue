<template>
	<fieldset class="yes-no">
		<legend class="yes-no__prompt">{{ prompt }}</legend>
		<div class="yes-no__choice">
			<button
				v-for="choice in CHOICES"
				:key="choice.label"
				type="button"
				class="yes-no__button"
				:class="`yes-no__button--${choice.label.toLowerCase()}`"
				:aria-pressed="wantsValue === choice.value"
				@click="choose(choice.value)"
			>
				{{ choice.label }}
			</button>
		</div>
		<div v-if="wantsValue" class="yes-no__field">
			<label :for="inputId" class="yes-no__label">{{ label }}</label>
			<InputText :id="inputId" v-model="textValue" :placeholder="placeholder" :maxlength="maxLength" @input="publish" />
			<small v-if="textValue.trim() === ''" class="yes-no__hint">Type the song to save your Yes.</small>
		</div>
	</fieldset>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import InputText from 'primevue/inputtext';

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
