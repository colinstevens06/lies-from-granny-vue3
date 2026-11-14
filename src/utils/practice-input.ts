import type { PracticeImport, PracticeInput, PracticeStatus } from '../models/practice';
import { isIsoDate } from './dates';
import { isRecord, parsed, rejected, type Parsed } from './parsed';

// Shared by the practice endpoint and the seed: relative imports only, no I/O.

const STATUSES: PracticeStatus[] = ['tentative', 'scheduled', 'cancelled', 'complete'];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_LINES = 30;

/** An optional array of trimmed strings, each 1..max characters. Undefined or missing is empty. */
const parseLines = (value: unknown, max: number): Parsed<string[]> => {
	if (value === undefined) return parsed([]);
	if (!Array.isArray(value) || value.length > MAX_LINES) return rejected('bad-lines');

	const lines: string[] = [];
	for (const raw of value) {
		const line = typeof raw === 'string' ? raw.trim() : '';
		if (line.length < 1 || line.length > max) return rejected('bad-lines');
		lines.push(line);
	}

	return parsed(lines);
};

interface PracticeFields {
	date: string;
	startTime?: string;
	endTime?: string;
	location?: string;
	status: PracticeStatus;
	prepare: string[];
	recap: string[];
}

const parseFields = (body: unknown): Parsed<PracticeFields> => {
	if (!isRecord(body)) return rejected('bad-body');
	if (!isIsoDate(body.date)) return rejected('bad-date');
	if (!STATUSES.includes(body.status as PracticeStatus)) return rejected('bad-status');

	const { startTime, endTime } = body;
	if ((startTime === undefined) !== (endTime === undefined)) return rejected('bad-time');
	if (startTime !== undefined) {
		if (typeof startTime !== 'string' || typeof endTime !== 'string') return rejected('bad-time');
		if (!TIME.test(startTime) || !TIME.test(endTime) || endTime <= startTime) return rejected('bad-time');
	}

	let location: string | undefined;
	if (body.location !== undefined) {
		if (typeof body.location !== 'string') return rejected('bad-location');
		location = body.location.trim() || undefined; // empty means omitted
		if (location !== undefined && location.length > 80) return rejected('bad-location');
	}

	const prepare = parseLines(body.prepare, 120);
	if (!prepare.ok) return prepare;
	const recap = parseLines(body.recap, 300);
	if (!recap.ok) return recap;

	return parsed({
		date: body.date,
		...(startTime !== undefined && { startTime: startTime as string, endTime: endTime as string }),
		...(location !== undefined && { location }),
		status: body.status as PracticeStatus,
		prepare: prepare.value,
		recap: recap.value
	});
};

export const parsePracticeInput = (body: unknown): Parsed<PracticeInput> => parseFields(body);

/** One `band-data/import.ts` practice: the same checks, plus an optional `gigId`. Empty lists are omitted. */
export const parsePracticeImport = (body: unknown): Parsed<PracticeImport> => {
	const fields = parseFields(body);
	if (!fields.ok) return fields;

	const gigId = (body as Record<string, unknown>).gigId;
	if (gigId !== undefined && !Number.isInteger(gigId)) return rejected('bad-gig');

	const { prepare, recap, ...rest } = fields.value;
	return parsed({
		...rest,
		...(prepare.length > 0 && { prepare }),
		...(recap.length > 0 && { recap }),
		...(gigId !== undefined && { gigId: gigId as number })
	});
};
