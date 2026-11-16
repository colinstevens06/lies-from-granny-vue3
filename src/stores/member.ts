import { ref } from 'vue';
import { defineStore } from 'pinia';
import { bandService } from '@/services/band-service';
import { ApiError } from '@models/api-error';
import type { CurrentMember } from '@models/band-member';

/**
 * The session store: who is signed in. The one store any other store may import (Speed Shopper's `userStore`).
 * `nav.vue` loads it on every page, so the heavy sign-in code (`@utils/da-band/auth`) and the dev-only switcher stay
 * behind dynamic imports; the small band service does not.
 */
export const useMemberStore = defineStore('member', () => {
	const me = ref<CurrentMember>();

	/** Loads who's signed in once. `signed-out` is a 401, `not-a-member` a 403. */
	const loadMe = async (): Promise<'ok' | 'signed-out' | 'not-a-member'> => {
		if (me.value) return 'ok';

		try {
			me.value = await bandService.getMe();
			return 'ok';
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) return 'signed-out';
			if (error instanceof ApiError && error.status === 403) return 'not-a-member';
			throw error;
		}
	};

	/** Drops the cached member, so the next band page asks the server again. */
	const forget = () => {
		me.value = undefined;
	};

	const signOut = async () => {
		// Local testing: the chosen member is the whole session, and Identity isn't running.
		if (import.meta.env.DEV) {
			const dev = await import('@utils/da-band/auth/dev-auth');
			if (dev.getDevMember()) {
				dev.clearDevMember();
				forget();
				return;
			}
		}

		const { signOut: leave } = await import('@utils/da-band/auth/auth');
		await leave();
		forget();
	};

	return { me, loadMe, forget, signOut };
});
