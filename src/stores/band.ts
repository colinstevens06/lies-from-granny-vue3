import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { CurrentMember } from '@models/band-member';

/** The only client holder of server data. nav.vue imports this store, so API code is imported inside actions. */
export const useBandStore = defineStore('band', () => {
	const me = ref<CurrentMember>();

	/** Loads who's signed in once. `signed-out` is a 401, `not-a-member` a 403. */
	const loadMe = async (): Promise<'ok' | 'signed-out' | 'not-a-member'> => {
		if (me.value) return 'ok';

		const { bandApi, BandApiError } = await import('@utils/band-api');
		try {
			me.value = await bandApi<CurrentMember>('me', { redirectOn401: false });
			return 'ok';
		} catch (error) {
			if (error instanceof BandApiError && error.status === 401) return 'signed-out';
			if (error instanceof BandApiError && error.status === 403) return 'not-a-member';
			throw error;
		}
	};

	const signOut = async () => {
		const { signOut } = await import('@utils/auth');
		await signOut();
		me.value = undefined;
	};

	return { me, loadMe, signOut };
});
