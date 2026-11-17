import { expect, test } from '@playwright/test';
import { makeForm } from '../src/test-utils/factories';

// Read-only smoke tests against Colin's dev server (`yarn netlify` on :8888, started by him). They never tap an
// answer, sign off, or fill, so the local database is left as it was. Signing in only stores the dev member in the
// browser (see src/utils/da-band/auth/dev-auth.ts).

test('public home page loads with its hero image', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('img', { name: /Lies From Granny band members/ })).toBeVisible();
});

test('/da-band sends a signed-out visitor to the login page with the local sign-in buttons', async ({ page }) => {
	await page.goto('/da-band');
	await expect(page).toHaveURL(/\/da-band\/login/);
	await expect(page.getByRole('heading', { name: 'Da Band' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Sign in as Anna' })).toBeVisible();
});

/** A 'YYYY-MM-DD' day some days from now. Only needs to be roughly right: the fixture form spans two months. */
const dayFromNow = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

test('signing in as Anna shows the Early 2027 planning form with its calendar and song question', async ({ page }) => {
	// The forms list is a fixture, so the test doesn't depend on Anna still having an unsigned open form in the local
	// database (after a sign-off or lock-in she has none). Reads only; any write would still reach the real server.
	const form = makeForm({
		id: 900001,
		dueDay: dayFromNow(14),
		availability: { startDay: dayFromNow(0), endDay: dayFromNow(60) },
		members: []
	});
	await page.route('**/api/band/forms', route =>
		route.request().method() === 'GET' ? route.fulfill({ json: [form] }) : route.continue()
	);

	await page.goto('/da-band/login');
	await page.getByRole('button', { name: 'Sign in as Anna' }).click();

	await expect(page).toHaveURL(/\/da-band$/);
	await page
		.getByRole('link', { name: /Keep going|Check and sign off/ })
		.first()
		.click();

	await expect(page).toHaveURL(/\/da-band\/form\/\d+/);
	await expect(page.getByRole('button', { name: 'Fill a weekday at once…' })).toBeVisible();
	await expect(page.getByRole('button', { name: /: (Pending|Yes|No|Not sure)$/ }).first()).toBeVisible();
	await expect(page.getByText('Would you like to suggest a new song?')).toBeVisible();
});
