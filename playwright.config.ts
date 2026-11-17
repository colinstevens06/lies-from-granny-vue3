import { defineConfig, devices } from '@playwright/test';

// Smoke E2E against Colin's own dev server (`yarn netlify` on :8888). No `webServer` block on purpose: sessions never
// start, stop or restart a dev server. If :8888 is down, the run fails on connect; start it yourself first.
export default defineConfig({
	testDir: 'e2e',
	reporter: 'list',
	use: { baseURL: 'http://localhost:8888' },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
