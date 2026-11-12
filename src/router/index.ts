import { createRouter, createWebHistory } from 'vue-router';
import { useBandStore } from '@/stores/band';

declare module 'vue-router' {
	interface RouteMeta {
		/** Needs a signed-in band member. The server is the real gate; this only decides where to send the browser. */
		requiresMember?: boolean;
	}
}

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'splash',
			component: () => import('./views/home.vue')
		},
		{
			path: '/home',
			name: 'home',
			component: () => import('./views/home.vue')
		},
		{
			path: '/contact',
			name: 'contact',
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import('./views/contact.vue')
		},
		{
			path: '/shows',
			name: 'shows',
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import('./views/shows.vue')
		},
		{
			path: '/songs',
			name: 'songs',
			// route level code-splitting
			// this generates a separate chunk (About.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import('./views/songs.vue')
		},
		{
			// Band-internal page: unlisted (not in the nav) and noindexed via public/_headers.
			path: '/da-band',
			name: 'da-band',
			component: () => import('./views/da-band.vue'),
			meta: { requiresMember: true }
		},
		{
			path: '/da-band/login',
			name: 'da-band-login',
			component: () => import('./views/da-band-login.vue')
		},
		{
			// Covered by the same /da-band/* noindex rule in public/_headers.
			path: '/da-band/history',
			name: 'da-band-history',
			component: () => import('./views/da-band-history.vue'),
			meta: { requiresMember: true }
		},
		{
			path: '/da-band/admin',
			name: 'da-band-admin',
			component: () => import('./views/da-band-admin.vue'),
			meta: { requiresMember: true }
		},
		{
			path: '/da-band/admin/forms/:id(\\d+)',
			name: 'da-band-admin-form',
			component: () => import('./views/da-band-admin-form.vue'),
			meta: { requiresMember: true }
		},
		{
			path: '/da-band/form/:id(\\d+)',
			name: 'da-band-form',
			component: () => import('./views/da-band-form.vue'),
			meta: { requiresMember: true }
		},
		{
			path: '/da-band/edit',
			name: 'da-band-edit',
			component: () => import('./views/da-band-edit.vue'),
			meta: { requiresMember: true }
		},
		{
			path: '/da-band/admin/practices',
			name: 'da-band-admin-practices',
			component: () => import('./views/da-band-admin-practices.vue'),
			meta: { requiresMember: true }
		},
		{ path: '/:catchAll(.*)', component: () => import('./views/_404.vue') }
	]
});

router.beforeEach(async to => {
	if (!to.meta.requiresMember) return;

	const status = await useBandStore().loadMe();
	if (status === 'signed-out') return { name: 'da-band-login', query: { redirect: to.fullPath } };
	if (status === 'not-a-member') return { name: 'da-band-login', query: { reason: 'not-a-member' } };
});

router.beforeResolve(() => {
	document.querySelector('body')?.scrollIntoView();
});

export default router;
