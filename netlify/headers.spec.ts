import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** The header lines under one path rule of public/_headers. */
const headersFor = (path: string) => {
	const lines = readFileSync('public/_headers', 'utf8').split(/\r?\n/);
	const start = lines.findIndex(line => line === path);
	if (start === -1) return [];

	const rest = lines.slice(start + 1);
	const end = rest.findIndex(line => !/^\s+\S/.test(line));
	return (end === -1 ? rest : rest.slice(0, end)).map(line => line.trim());
};

// Security review #3 (planning/2026-11-da-band-security-review.md): the band pages must not be framed or sniffed.
describe('public/_headers', () => {
	it.each(['/da-band', '/da-band/*'])('hardens %s', path => {
		const headers = headersFor(path);
		expect(headers).toContain('X-Frame-Options: DENY');
		expect(headers).toContain("Content-Security-Policy: frame-ancestors 'none'");
		expect(headers).toContain('X-Content-Type-Options: nosniff');
		expect(headers).toContain('Referrer-Policy: same-origin');
		expect(headers).toContain('X-Robots-Tag: noindex, nofollow');
	});

	it('leaves the public site without a frame ban', () => {
		const text = readFileSync('public/_headers', 'utf8');
		expect(text).not.toMatch(/^\/\*/m);
	});
});
