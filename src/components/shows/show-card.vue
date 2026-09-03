<template>
	<div class="show-card">
		<div class="grid">
			<div class="col-12 md:col-6 gig-image">
				<img
					:src="flyerSrc"
					:srcset="flyerSrcset"
					sizes="(min-width: 768px) 270px, 100vw"
					:alt="gig.imgAlt"
					:width="gig.imgWidth"
					:height="gig.imgHeight"
					class="w-full img-fluid"
					loading="lazy"
					decoding="async"
				/>
			</div>

			<div class="col-12 md:col-6">
				<div class="gig-title">{{ gig.name }}</div>
				<div class="gig-deets">{{ gig.date }}</div>
				<template v-for="detail in gig.text" :key="detail">
					<p v-html="detail"></p>
				</template>
				<div v-if="gig.songs?.length > 0">
					<div class="gig-text my-3">New songs included:</div>
					<ul>
						<li v-for="song in gig.songs" :key="song">{{ song }}</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { Gig } from '@models/gig';
	import { netlifyImage } from '@utils/images';
	import { computed } from 'vue';

	const props = defineProps<{
		gig: Gig;
	}>();

	const flyerSrc = computed(() => netlifyImage(props.gig.img, 400));
	const flyerSrcset = computed(() => `${flyerSrc.value} 400w, ${netlifyImage(props.gig.img, 800)} 800w`);
</script>
