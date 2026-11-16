import type { Config } from '@netlify/functions';
import { parsePracticeInput } from '../../src/utils/da-band/practice-input';
import { createPractice, listPractices, updatePractice } from '../lib/band-db';
import {
	authenticate,
	checkWrite,
	created,
	fail,
	idFrom,
	json,
	methodNotAllowed,
	readBody,
	respond,
	subPath
} from '../lib/http';
import type { Practice } from '../../src/models/practice';

// GET /practices (members), POST /practices and PUT /practices/:id (admin; whole record). Practices are never
// deleted; they're cancelled with a PUT.

export default async (req: Request) => {
	const [rawId, ...extra] = subPath(req);
	if (extra.length > 0) return fail(404, 'not-found');

	const allowed = rawId === undefined ? ['GET', 'POST'] : ['PUT'];
	if (!allowed.includes(req.method)) return methodNotAllowed(allowed);

	if (req.method === 'GET') {
		const current = await authenticate(req);
		return current instanceof Response ? current : json(200, await listPractices());
	}

	const refused = checkWrite(req);
	if (refused) return refused;
	const id = idFrom(rawId);
	if (rawId !== undefined && id === undefined) return fail(404, 'not-found');

	const current = await authenticate(req, true);
	if (current instanceof Response) return current;

	const input = parsePracticeInput(await readBody(req));
	if (!input.ok) return fail(400, input.error);

	if (id === undefined) {
		return respond(await createPractice(input.value, current.member), (practice: Practice) =>
			created(practice, `/api/band/practices/${practice.id}`)
		);
	}

	return respond(await updatePractice(id, input.value, current.member), practice => json(200, practice));
};

export const config: Config = { path: ['/api/band/practices', '/api/band/practices/:id'] };
