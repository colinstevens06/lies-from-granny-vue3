import type { Config } from '@netlify/functions';
import { authenticate, json, methodNotAllowed } from '../lib/http';

export default async (req: Request) => {
	if (req.method !== 'GET') return methodNotAllowed();

	const current = await authenticate();
	return current instanceof Response ? current : json(200, current);
};

export const config: Config = { path: '/api/band/me' };
