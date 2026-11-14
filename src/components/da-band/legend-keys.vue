<template>
	<div class="flex flex-wrap align-items-center column-gap-3 row-gap-1 text-xs text-black-alpha-70">
		<span v-for="item in items" :key="item.label" class="inline-flex align-items-center gap-1">
			<i class="relative overflow-hidden block flex-none w-1rem h-1rem border-round" :class="item.swatch">
				<b v-if="item.band" class="absolute left-0 right-0 bottom-0 bg-gray-900" style="height: 4px" />
			</i>
			{{ item.label }}
		</span>
	</div>
</template>

<script lang="ts">
	export interface LegendItem {
		label: string;
		/** The classes that color the swatch, the same ones the real cell or day wears. */
		swatch: string;
		/** A black strip along the bottom, the "no show" cell's mark. */
		band?: boolean;
	}
</script>

<script setup lang="ts">
	// The color key above the answer grid and the band calendar: a swatch (its classes) and a label per entry.
	defineProps<{ items: LegendItem[] }>();
</script>
