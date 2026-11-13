import { expect, test } from '@playwright/test';

// Read-only smoke tests against Colin's dev server (`yarn netlify` on :8888, started by him). They never tap an
// answer, sign off, or fill, so the local database is left as it was. Signing in only stores the dev member in the
// browser (see src/utils/dev-auth.ts).

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

test('signing in as Anna shows the Early 2027 planning form with its calendar and song question', async ({ page }) => {
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
