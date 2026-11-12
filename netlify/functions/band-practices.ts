import type { Config } from '@netlify/functions';
import { parsePracticeInput } from '../../src/utils/practice-input';
import { createPractice, listPractices, updatePractice } from '../lib/band-db';
import {
	authenticate,
	checkWrite,
	fail,
	idFrom,
	json,
	methodNotAllowed,
	readBody,
	respond,
	subPath
} from '../lib/http';

export default async (req: Request) => {
	const [rawId, ...extra] = subPath(req);
	if (extra.length > 0) return fail(404, 'not-found');

	if (req.method === 'GET') {
		if (rawId !== undefined) return fail(404, 'not-found');

		const current = await authenticate();
		return current instanceof Response ? current : json(200, { practices: await listPractices() });
	}

	const creating = req.method === 'POST' && rawId === undefined;
	const updating = req.method === 'PUT' && rawId !== undefined;
	if (!creating && !updating) return methodNotAllowed();
	const refused = checkWrite(req);
	if (refused) return refused;
	const id = idFrom(rawId);
	if (updating && id === undefined) return fail(404, 'not-found');

	const current = await authenticate(true);
	if (current instanceof Response) return current;

	const input = parsePracticeInput(await readBody(req));
	if (!input.ok) return fail(400, input.error);

	return respond(
		creating
			? await createPractice(input.value, current.member)
			: await updatePractice(id!, input.value, current.member),
		practice => json(creating ? 201 : 200, { practice })
	);
};

export const config: Config = { path: ['/api/band/practices', '/api/band/practices/:id'] };
