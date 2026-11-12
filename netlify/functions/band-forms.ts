import type { Config } from '@netlify/functions';
import { easternNow } from '../../src/utils/dates';
import { closeForm, listForms, lockIn, saveFormAnswer, signOff } from '../lib/band-db';
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

type Action = 'answers' | 'sign-off' | 'lock-in' | 'close';

/** Which method each action takes, and whether only the admin may. */
const ACTIONS: Record<Action, { method: string; admin: boolean }> = {
	answers: { method: 'PUT', admin: false },
	'sign-off': { method: 'POST', admin: false },
	'lock-in': { method: 'POST', admin: true },
	close: { method: 'POST', admin: true }
};

export default async (req: Request) => {
	const [rawId, action, ...extra] = subPath(req);

	if (rawId === undefined) {
		if (req.method !== 'GET') return methodNotAllowed();

		const current = await authenticate();
		return current instanceof Response ? current : json(200, { forms: await listForms() });
	}

	const rule = ACTIONS[action as Action];
	if (!Object.prototype.hasOwnProperty.call(ACTIONS, action) || extra.length > 0) return fail(404, 'not-found');
	if (req.method !== rule.method) return methodNotAllowed();
	const refused = checkWrite(req);
	if (refused) return refused;
	const formId = idFrom(rawId);
	if (formId === undefined) return fail(404, 'not-found');

	const current = await authenticate(rule.admin);
	if (current instanceof Response) return current;

	const body = await readBody(req);
	if (typeof body !== 'object' || body === null || Array.isArray(body)) return fail(400, 'bad-body');
	const today = easternNow().slice(0, 10);

	switch (action as Action) {
		case 'answers':
			return respond(await saveFormAnswer(formId, current.member, body), form => json(200, { form }));
		case 'sign-off':
			return respond(await signOff(formId, current.member, today), form => json(200, { form }));
		case 'lock-in':
			return respond(await lockIn(formId, body, current.member, today), result => json(200, result));
		case 'close':
			return respond(await closeForm(formId, current.member), form => json(200, { form }));
	}
};

export const config: Config = { path: ['/api/band/forms', '/api/band/forms/*'] };
