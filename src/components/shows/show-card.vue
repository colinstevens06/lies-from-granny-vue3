<template>
	<div class="show-card">
		<div class="grid">
			<div class="col-12 md:col-6 gig-image">
				<img :src="gig.img" :alt="gig.imgAlt" class="w-full img-fluid" />
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

	defineProps<{
		gig: Gig;
	}>();
</script>
