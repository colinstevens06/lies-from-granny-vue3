import { getUser } from '@netlify/identity';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentMember, requireAdmin } from './current-member';

vi.mock('@netlify/identity', () => ({ getUser: vi.fn(async () => null) }));

const request = (url = 'http://localhost:8888/api/band/me') =>
	new Request(url, { headers: { 'x-dev-member': 'colin' } });

/** What `netlify dev` sets, per the CLI source: NETLIFY_DEV, NETLIFY_LOCAL and CONTEXT, DEPLOY_ID=0 (CLI 27's placeholder), and no NETLIFY. */
const asNetlifyDev = () => {
	vi.stubEnv('NETLIFY_DEV', 'true');
	vi.stubEnv('NETLIFY_LOCAL', 'true');
	vi.stubEnv('CONTEXT', 'dev');
	vi.stubEnv('DEPLOY_ID', '0');
};

afterEach(() => {
	vi.unstubAllEnvs();
});

/** The next `getUser()` returns an Identity user with these roles. */
const signedInWith = (...roles: string[]) => vi.mocked(getUser).mockResolvedValueOnce({ id: 'user-1', roles });

// Code review on PR 21: the spec only covered the local-testing bypass; this is the check production runs.
describe('Identity roles', () => {
	it('is signed-out with no Identity user', async () => {
		expect(await getCurrentMember()).toBe('signed-out');
	});

	it('maps one member role to that member', async () => {
		signedInWith('nick');
		expect(await getCurrentMember()).toEqual({ member: 'nick', role: 'member' });
	});

	it('adds admin from the admin role', async () => {
		signedInWith('colin', 'admin');
		expect(await getCurrentMember()).toEqual({ member: 'colin', role: 'admin' });
	});

	it('ignores roles that are not band members', async () => {
		signedInWith('nick', 'editor');
		expect(await getCurrentMember()).toEqual({ member: 'nick', role: 'member' });
	});

	it.each([[[]], [['admin']], [['editor']], [['nick', 'colin']]])('is not-a-member with roles %j', async roles => {
		signedInWith(...roles);
		expect(await getCurrentMember()).toBe('not-a-member');
	});

	it('is not-a-member with no roles at all', async () => {
		vi.mocked(getUser).mockResolvedValueOnce({ id: 'user-1' });
		expect(await getCurrentMember()).toBe('not-a-member');
	});

	it('refuses admin to a member without the admin role', async () => {
		signedInWith('nick');
		expect(await requireAdmin()).toBe('not-admin');
	});

	it('ignores the dev header outside netlify dev', async () => {
		signedInWith('nick');
		expect(await getCurrentMember(request())).toEqual({ member: 'nick', role: 'member' });
	});
});

describe('dev sign-in bypass', () => {
	it('works under netlify dev on localhost', async () => {
		asNetlifyDev();
		expect(await getCurrentMember(request())).toEqual({ member: 'colin', role: 'admin' });
	});

	it('works when DEPLOY_ID is unset', async () => {
		asNetlifyDev();
		vi.stubEnv('DEPLOY_ID', '');
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
