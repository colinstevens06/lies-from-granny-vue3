import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'splash',
			component: () => import('./views/show-splash.vue')
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
		{ path: '/:catchAll(.*)', component: () => import('./views/_404.vue') }
	]
});

router.beforeResolve(() => {
	document.querySelector('body')?.scrollIntoView();
});

export default router;
