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
		<template v-if="wantsValue">
			<div v-for="(row, rowIndex) in localRows" :key="row.key" class="yes-no__row">
				<div v-for="(field, fieldIndex) in fields" :key="field" class="yes-no__field">
					<label :for="`${row.key}-${fieldIndex}`">{{ field }}</label>
					<InputText :id="`${row.key}-${fieldIndex}`" v-model="row.values[fieldIndex]" @input="onEdit" />
				</div>
				<small v-if="isPartial(row)" class="yes-no__hint">Fill in every field to save this one.</small>
				<button
					v-if="allowSeveral && localRows.length > 1"
					type="button"
					class="yes-no__remove"
					@click="removeRow(rowIndex)"
				>
					Remove
				</button>
			</div>
			<button
				v-if="allowSeveral && localRows.length < maxRows"
				type="button"
				class="yes-no__add"
				@click="localRows.push(blankRow())"
			>
				+ Add another
			</button>
		</template>
	</fieldset>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import InputText from 'primevue/inputtext';

	// A yes/no question; Yes reveals ordered rows of labeled inputs. It emits only complete rows. A partly filled row
	// stays here and in `update:draft`, so the shell can keep it on the device (drafts) without sending it anywhere.
	const props = withDefaults(
		defineProps<{
			prompt: string;
			/** Row labels, in order, e.g. ['Song', 'Band']. */
			fields: string[];
			allowSeveral?: boolean;
			/** The saved answer: undefined until chosen. */
			wants?: boolean;
			/** The saved complete rows, in order. */
			rows?: string[][];
			/** Partly filled rows restored from the device. */
			draft?: string[][];
			maxRows?: number;
		}>(),
		{ allowSeveral: false, wants: undefined, rows: () => [], draft: () => [], maxRows: 20 }
	);

	const emit = defineEmits<{
		/** The complete-rows value. `rows` is empty for No. */
		change: [value: { wants: boolean; rows: string[][] }];
		'update:draft': [rows: string[][]];
	}>();

	interface Row {
		key: string;
		values: string[];
	}

	const CHOICES = [
		{ label: 'Yes', value: true },
		{ label: 'No', value: false }
	];

	let counter = 0;
	const blankRow = (values: string[] = []): Row => ({
		key: `yes-no-${Math.random().toString(36).slice(2, 8)}-${counter++}`,
		values: props.fields.map((_, index) => values[index] ?? '')
	});

	const wantsValue = ref(props.wants);
	const localRows = ref<Row[]>([...props.rows, ...props.draft].map(values => blankRow(values)));
	if (wantsValue.value && localRows.value.length === 0) localRows.value.push(blankRow());

	const isFilled = (row: Row) => row.values.every(value => value.trim() !== '');
	const isEmpty = (row: Row) => row.values.every(value => value.trim() === '');
	const isPartial = (row: Row) => !isFilled(row) && !isEmpty(row);

	const publish = () => {
		const rows = wantsValue.value ? localRows.value.filter(isFilled).map(row => row.values.map(v => v.trim())) : [];
		emit('change', { wants: wantsValue.value === true, rows });
		emit('update:draft', wantsValue.value ? localRows.value.filter(isPartial).map(row => [...row.values]) : []);
	};

	const onEdit = () => publish();

	const choose = (value: boolean) => {
		if (value === wantsValue.value) return;
		if (!value && localRows.value.some(row => !isEmpty(row)) && !window.confirm('Clear what you filled in?')) return;

		wantsValue.value = value;
		localRows.value = value ? [blankRow()] : [];
		publish();
	};

	const removeRow = (index: number) => {
		localRows.value.splice(index, 1);
		publish();
	};
</script>
