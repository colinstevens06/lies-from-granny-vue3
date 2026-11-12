import type { Config } from '@netlify/functions';
import { members } from '../../src/components/band/members';
import type { MemberId } from '../../src/models/band-member';
import { parseAvailabilityChanges } from '../../src/utils/availability';
import { easternNow } from '../../src/utils/dates';
import { listAvailability, writeAvailability } from '../lib/band-db';
import { authenticate, checkWrite, fail, json, methodNotAllowed, readBody } from '../lib/http';

export default async (req: Request) => {
	const target = new URL(req.url).pathname.replace(/\/+$/, '').split('/')[4] as MemberId | undefined;

	if (req.method === 'GET') {
		if (target !== undefined) return fail(404, 'not-found');

		const current = await authenticate();
		if (current instanceof Response) return current;

		return json(200, { members: await listAvailability() });
	}

	if (req.method !== 'PATCH') return methodNotAllowed();
	const refused = checkWrite(req);
	if (refused) return refused;
	if (!members.some(m => m.id === target)) return fail(404, 'not-found');

	const current = await authenticate();
	if (current instanceof Response) return current;
	const isAdmin = current.role === 'admin';
	if (target !== current.member && !isAdmin) return fail(403, 'not-yours');

	const parsed = parseAvailabilityChanges(await readBody(req), {
		today: easternNow().slice(0, 10),
		memberLimits: !isAdmin
	});
	if (!parsed.ok) return fail(400, parsed.error);

	// Your own row is always 'self'. The admin writing someone else's row may pick the source.
	const own = target === current.member;
	await writeAvailability(
		target!,
		parsed.value.changes,
		{ source: own ? 'self' : parsed.value.source ?? 'manual', by: current.member },
		{ respectPrecedence: false }
	);

	const [availability] = await listAvailability(target);
	return json(200, { availability });
};

export const config: Config = { path: ['/api/band/availability', '/api/band/availability/:member'] };
