import { describe, expect, it } from 'vitest';
import { bandRedirect } from './band-redirect';

describe('bandRedirect', () => {
	it.each(['/da-band', '/da-band/form/3', '/da-band/admin?tab=forms', '/da-band/history#top'])('keeps %s', path => {
		expect(bandRedirect(path)).toBe(path);
	});

	it.each([
		'//evil.example/da-band',
		'/\\evil.example/da-band',
		'https://evil.example/da-band',
		'javascript:alert(1)',
		'/da-bandits',
		'/shows',
		'/da-band/../shows',
		'',
		undefined,
		['/da-band']
	])('sends %s to /da-band', value => {
		expect(bandRedirect(value)).toBe('/da-band');
	});
});
