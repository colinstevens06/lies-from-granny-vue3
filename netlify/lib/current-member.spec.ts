import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentMember } from './current-member';

vi.mock('@netlify/identity', () => ({ getUser: vi.fn(async () => null) }));

const request = (url = 'http://localhost:8888/api/band/me') =>
	new Request(url, { headers: { 'x-dev-member': 'colin' } });

/** What `netlify dev` sets, per the CLI source: NETLIFY_DEV, NETLIFY_LOCAL and CONTEXT, and no DEPLOY_ID or NETLIFY. */
const asNetlifyDev = () => {
	vi.stubEnv('NETLIFY_DEV', 'true');
	vi.stubEnv('NETLIFY_LOCAL', 'true');
	vi.stubEnv('CONTEXT', 'dev');
};

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('dev sign-in bypass', () => {
	it('works under netlify dev on localhost', async () => {
		asNetlifyDev();
		expect(await getCurrentMember(request())).toEqual({ member: 'colin', role: 'admin' });
	});

	it('is ignored off localhost', async () => {
		asNetlifyDev();
		expect(await getCurrentMember(request('https://liesfromgranny.com/api/band/me'))).toBe('signed-out');
	});

	// Security review #1 (planning/2026-11-da-band-security-review.md): the three gate variables could be set by
	// mistake in the Netlify UI. A deployed function always has DEPLOY_ID, and a Netlify build has NETLIFY, so either
	// one switches the bypass off for good.
	it.each(['DEPLOY_ID', 'NETLIFY'])(
		'is ignored when %s is set, even if the gate variables are (security #1)',
		async name => {
			asNetlifyDev();
			vi.stubEnv(name, 'x');
			expect(await getCurrentMember(request())).toBe('signed-out');
		}
	);
});
