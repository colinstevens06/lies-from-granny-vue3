import type { Config } from '@netlify/functions';
import { parseFlagPatch } from '../../src/utils/da-band/forms';
import { todayEastern } from '../../src/utils/dates';
import { closeForm, listForms, lockIn, saveFormAnswer, signOff } from '../lib/band-db';
import {
	authenticate,
	checkWrite,
	fail,
	idFrom,
	json,
	memberFrom,
	methodNotAllowed,
	readBody,
	respond,
	subPath
} from '../lib/http';

// Resources (REST shape: ~/.claude/rules/api.md):
//   GET   /forms                              every form
//   PATCH /forms/:id                          { closed: true }       admin
//   PUT   /forms/:id/schedule                 { days }               admin: creates the practices and closes the form
//   PATCH /forms/:id/members/:member          { signedOff: true }    that member only
//   PUT   /forms/:id/members/:member/answers  the form's answer body that member only
// A write returns the resource the screen shows: the form, or for a schedule its practices.

type Route = 'form' | 'schedule' | 'member' | 'answers';

/** Each route's one method, and whether only the admin may use it. */
const ROUTES: Record<Route, { method: string; admin: boolean }> = {
	form: { method: 'PATCH', admin: true },
	schedule: { method: 'PUT', admin: true },
	member: { method: 'PATCH', admin: false },
	answers: { method: 'PUT', admin: false }
};

/** The route a path below /forms/:id names, or undefined (a 404). */
const routeOf = (child?: string, member?: string, grandchild?: string, extra: string[] = []): Route | undefined => {
	if (extra.length > 0) return undefined;
	if (child === undefined) return 'form';
	if (child === 'schedule' && member === undefined) return 'schedule';
	if (child !== 'members' || member === undefined) return undefined;
	if (grandchild === undefined) return 'member';
	return grandchild === 'answers' ? 'answers' : undefined;
};

export default async (req: Request) => {
	const [rawId, child, rawMember, grandchild, ...extra] = subPath(req);

	if (rawId === undefined) {
		if (req.method !== 'GET') return methodNotAllowed(['GET']);

		const current = await authenticate(req);
		return current instanceof Response ? current : json(200, await listForms());
	}

	const route = routeOf(child, rawMember, grandchild, extra);
	if (!route) return fail(404, 'not-found');
	const rule = ROUTES[route];
	if (req.method !== rule.method) return methodNotAllowed([rule.method]);
	const refused = checkWrite(req);
	if (refused) return refused;
	const formId = idFrom(rawId);
	if (formId === undefined) return fail(404, 'not-found');
	const target = memberFrom(rawMember);
	if (rawMember !== undefined && target === undefined) return fail(404, 'not-found');

	const current = await authenticate(req, rule.admin);
	if (current instanceof Response) return current;
	// A member's sign-off and answers are theirs alone, the admin's included.
	if (target !== undefined && target !== current.member) return fail(403, 'not-yours');

	const body = await readBody(req);
	const today = todayEastern();
	const asForm = (result: unknown) => respond(result, form => json(200, form));

	switch (route) {
		case 'form': {
			const patch = parseFlagPatch(body, 'closed');
			return patch.ok ? asForm(await closeForm(formId, current.member)) : fail(400, patch.error);
		}
		case 'schedule':
			return respond(await lockIn(formId, body, current.member, today), practices => json(200, practices));
		case 'member': {
			const patch = parseFlagPatch(body, 'signedOff');
			return patch.ok ? asForm(await signOff(formId, current.member, today)) : fail(400, patch.error);
		}
		case 'answers':
			return asForm(await saveFormAnswer(formId, current.member, body));
	}
};

export const config: Config = { path: ['/api/band/forms', '/api/band/forms/*'] };
