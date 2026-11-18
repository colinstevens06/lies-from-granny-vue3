<template>
	<div class="rock-horns-loader flex justify-content-center py-5" role="progressbar" :aria-label>
		<svg class="rock-horns-hand" viewBox="4 4 40 62" width="52" height="80" aria-hidden="true">
			<g
				v-for="layer in layers"
				:key="layer.color"
				fill="none"
				:stroke="layer.color"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path v-for="bone in bones" :key="bone" :d="bone" :stroke-width="layer.bone" />
				<path v-for="[x, y] in joints" :key="`${x},${y}`" :d="`M${x} ${y}h0`" :stroke-width="layer.joint" />
			</g>
		</svg>
	</div>
</template>

<script setup lang="ts">
	// The /da-band loader: a skeleton hand throwing the horns, rocking and shifting pink to black (Speed Shopper's cart
	// loader, reskinned). It mounts at once for screen readers but is drawn only after 0.2 s, so a fast load never
	// flashes it; the rock and the fade-in are in _da-band.scss.
	// withDefaults, not a destructured default: destructured prop defaults need Vue 3.5 and this repo is on 3.4.
	withDefaults(defineProps<{ ariaLabel?: string }>(), { ariaLabel: 'Loading' });

	// Each bone is a line and each joint a zero-length round-capped stroke (a dot). Drawn twice: a thick outline in the
	// animated color, then a thin white core, which gives the x-ray look.
	const bones = [
		// forearm
		'M21 63 L21.5 51',
		'M27 63 L26.5 51',
		// palm
		'M19.5 45 L15.5 31.5',
		'M22.5 44 L21.5 30.5',
		'M25.5 44 L27 30.5',
		'M28.5 45 L32.5 32',
		// index, up
		'M15.5 31.5 L13.5 22.5',
		'M13.5 22.5 L12.5 15.5',
		'M12.5 15.5 L12 10',
		// pinky, up
		'M32.5 32 L35.5 23.5',
		'M35.5 23.5 L37 17',
		'M37 17 L38 11.5',
		// middle and ring, folded
		'M21.5 30.5 L21.5 27.5',
		'M27 30.5 L27 27.5',
		// thumb, across the folded fingers
		'M19 47.5 L13 41.5',
		'M13 41.5 L16.5 35.5',
		'M16.5 35.5 L24.5 34'
	];
	const joints: [number, number][] = [
		[21, 48.5],
		[24, 47.5],
		[27, 48.5],
		[15.5, 31.5],
		[21.5, 30.5],
		[27, 30.5],
		[32.5, 32],
		[13.5, 22.5],
		[12.5, 15.5],
		[35.5, 23.5],
		[37, 17],
		[21.5, 27.5],
		[27, 27.5],
		[13, 41.5],
		[16.5, 35.5]
	];
	const layers = [
		{ color: 'currentColor', bone: 3.4, joint: 4.4 },
		{ color: '#fff', bone: 1.4, joint: 2.2 }
	];
</script>
