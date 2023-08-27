import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';

//theme
import './styles/_theme.scss';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

import '/node_modules/primeflex/primeflex.css';
import './styles/index.scss';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue);

app.mount('#app');
