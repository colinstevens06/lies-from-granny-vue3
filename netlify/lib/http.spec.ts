import { getUser } from '@netlify/identity';
import { describe, expect, it, vi } from 'vitest';
import { authenticate, checkWrite, created, idFrom, memberFrom, methodNotAllowed } from './http';

vi.mock('@netlify/identity', () => ({ getUser: vi.fn(async () => null) }));

const read = () => new Request('https://liesfromgranny.com/api/band/me');

const statusOf = async (result: Awaited<ReturnType<typeof authenticate>>) =>
	result instanceof Response ? result.status : 'passed';

describe('authenticate', () => {
	it('answers 401 when signed out', async () => {
		expect(await statusOf(await authenticate(read()))).toBe(401);
	});

	it('answers 403 for an account that is not a band member', async () => {
		vi.mocked(getUser).mockResolvedValueOnce({ id: 'user-1', roles: [] });
		expect(await statusOf(await authenticate(read()))).toBe(403);
	});

	it('answers 403 when a member calls an admin route', async () => {
		vi.mocked(getUser).mockResolvedValueOnce({ id: 'user-1', roles: ['nick'] });
		expect(await statusOf(await authenticate(read(), true))).toBe(403);
	});

	it('returns the caller when they pass', async () => {
		vi.mocked(getUser).mockResolvedValueOnce({ id: 'user-1', roles: ['colin', 'admin'] });
		expect(await authenticate(read(), true)).toEqual({ member: 'colin', role: 'admin' });
	});
});

const write = (headers: Record<string, string>) =>
	new Request('https://liesfromgranny.com/api/band/forms/1', { method: 'PATCH', headers });

describe('checkWrite', () => {
	it('passes a same-origin JSON write', () => {
		expect(
			checkWrite(write({ origin: 'https://liesfromgranny.com', 'content-type': 'application/json' }))
		).toBeUndefined();
	});

	it('refuses another origin with 403', () => {
		expect(checkWrite(write({ origin: 'https://evil.example', 'content-type': 'application/json' }))?.status).toBe(403);
	});

	it('refuses a body that is not JSON with 415', () => {
		expect(checkWrite(write({ origin: 'https://liesfromgranny.com', 'content-type': 'text/plain' }))?.status).toBe(415);
	});
});

describe('responses', () => {
	it('names the allowed methods on a 405', () => {
		const response = methodNotAllowed(['GET', 'POST']);
		expect(response.status).toBe(405);
		expect(response.headers.get('allow')).toBe('GET, POST');
	});

	it('points a 201 at the new resource', () => {
		const response = created({ id: 7 }, '/api/band/practices/7');
		expect(response.status).toBe(201);
		expect(response.headers.get('location')).toBe('/api/band/practices/7');
	});
});

describe('memberFrom', () => {
	it('reads a band member id and refuses anything else', () => {
		expect(memberFrom('colin')).toBe('colin');
		expect(memberFrom('mallory')).toBeUndefined();
		expect(memberFrom(undefined)).toBeUndefined();
	});
});

describe('idFrom', () => {
	it('reads a positive integer path segment', () => {
		expect(idFrom('1')).toBe(1);
		expect(idFrom('2147483647')).toBe(2147483647);
	});

	// Copilot review on PR 21: a ten-digit id past Postgres `integer` made the query throw, a 500 instead of a 404.
	it.each(['2147483648', '9999999999', '0', '01', '-1', 'abc', '', undefined])('rejects %s', segment => {
		expect(idFrom(segment)).toBeUndefined();
	});
});
