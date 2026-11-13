import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Vitest docs: merge the Vite config so the plugins and aliases are shared. `e2e/` belongs to Playwright.
export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: 'jsdom',
			include: ['src/**/*.{spec,test}.ts'],
			setupFiles: ['src/test-utils/setup.ts']
		}
	})
);
