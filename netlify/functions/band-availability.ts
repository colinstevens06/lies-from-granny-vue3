import type { Config } from '@netlify/functions';
import { parseAvailabilityChanges } from '../../src/utils/da-band/availability';
import { todayEastern } from '../../src/utils/dates';
import { listAvailability, writeAvailability } from '../lib/band-db';
import { authenticate, checkWrite, fail, json, memberFrom, methodNotAllowed, readBody, subPath } from '../lib/http';

// GET /availability (every member's row) and PATCH /availability/:member { changes } (that member, or the admin).

export default async (req: Request) => {
	const [rawMember, ...extra] = subPath(req);
	if (extra.length > 0) return fail(404, 'not-found');

	if (rawMember === undefined) {
		if (req.method !== 'GET') return methodNotAllowed(['GET']);

		const current = await authenticate(req);
		return current instanceof Response ? current : json(200, await listAvailability());
	}

	if (req.method !== 'PATCH') return methodNotAllowed(['PATCH']);
	const refused = checkWrite(req);
	if (refused) return refused;
	const target = memberFrom(rawMember);
	if (target === undefined) return fail(404, 'not-found');

	const current = await authenticate(req);
	if (current instanceof Response) return current;
	const isAdmin = current.role === 'admin';
	if (target !== current.member && !isAdmin) return fail(403, 'not-yours');

	const parsed = parseAvailabilityChanges(await readBody(req), {
		today: todayEastern(),
		memberLimits: !isAdmin
	});
	if (!parsed.ok) return fail(400, parsed.error);

	// Your own row is always 'self'. The admin writing someone else's row may pick the source.
	const own = target === current.member;
	await writeAvailability(
		target,
		parsed.value.changes,
		{ source: own ? 'self' : parsed.value.source ?? 'manual', by: current.member },
		{ respectPrecedence: false }
	);

	const [row] = await listAvailability(target);
	return json(200, row);
};

export const config: Config = { path: ['/api/band/availability', '/api/band/availability/:member'] };
