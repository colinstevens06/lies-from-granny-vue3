import { mount, type ComponentMountingOptions } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import type { Component } from 'vue';

/** Mounts with the PrimeVue plugin, as `src/main.ts` does. Teleported overlays (Sidebar) render into document.body. */
export const mountWithPrime = <T extends Component>(component: T, options: ComponentMountingOptions<T> = {}) =>
	mount(component, {
		attachTo: document.body,
		...options,
		global: { ...options.global, plugins: [PrimeVue, ...(options.global?.plugins ?? [])] }
	} as ComponentMountingOptions<T>);
