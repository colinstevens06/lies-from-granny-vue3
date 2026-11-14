import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import { hasAuthCallbackHash } from './utils/auth-hash';

//theme
import './styles/_theme.scss';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

import '/node_modules/primeflex/primeflex.css';
import './styles/index.scss';

const app = createApp(App);

app.use(createPinia());
app.use(PrimeVue);

// Google sends the browser back with the sign-in in the URL hash. Finish it before the router's first guard runs.
// Only a callback hash pulls in the Identity library; every other visit skips it.
const finishSignIn = async () => {
	const { completeAuthCallback } = await import('./utils/auth');
	window.history.replaceState(undefined, '', await completeAuthCallback());
};

// If the Identity chunk can't load, the public site must still mount.
(hasAuthCallbackHash() ? finishSignIn() : Promise.resolve())
	.catch(() => undefined)
	.then(() => {
		app.use(router);
		app.mount('#app');
	});
