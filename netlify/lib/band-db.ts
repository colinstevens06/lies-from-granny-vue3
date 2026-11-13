import { getDatabase } from '@netlify/database';
import { members } from '../../src/components/da-band/members';
import { shows } from '../../src/components/shows/shows';
import { ruleFor } from '../../src/forms/rules';
import type {
	AvailabilityChange,
	AvailabilitySource,
	DayAnswer,
	MemberAvailability
} from '../../src/models/availability';
import type { MemberId } from '../../src/models/band-member';
import type { Form, FormAvailability } from '../../src/models/form';
import type { Practice, PracticeImport, PracticeInput } from '../../src/models/practice';
import { parseLockIn } from '../../src/utils/forms';
import { handlerFor } from '../forms';
import { failure, isFailure, type Failure } from './failure';

// The only importer of @netlify/database. Every export takes an optional `db` (a scripts/ caller passes its own).
// Every value is a parameter. Dates and timestamps leave SQL as text.

export interface QueryResult {
	rows: Record<string, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
	rowCount: number | null;
}

/** A pool or a checked-out client: the little both drivers share. */
export interface Queryable {
	query(text: string, values?: unknown[]): Promise<QueryResult>;
}

interface PoolClient extends Queryable {
	release(): void;
}

export interface Db extends Queryable {
	connect(): Promise<PoolClient>;
}

export const openDb = (connectionString?: string): Db => getDatabase({ connectionString }).pool as unknown as Db;

/** Runs `work` in one transaction: commit on return, roll back on a throw (or when `work` returns `rollback`). */
export const inTransaction = async <T>(db: Db | undefined, work: (client: Queryable) => Promise<T>): Promise<T> => {
	const client = await (db ?? openDb()).connect();
	try {
		await client.query('begin');
		const result = await work(client);
		await client.query('commit');
		return result;
	} catch (error) {
		await client.query('rollback').catch(() => undefined);
		throw error;
	} finally {
		client.release();
	}
};

/** Thrown inside `inTransaction` to roll back and hand a value to the caller (a dry run, a lost race). */
export class Rollback<T> {
	constructor(readonly value: T) {}
}

/** Like `inTransaction`, but a thrown `Rollback` rolls back and returns its value instead of throwing. */
export const inRollbackableTransaction = async <T>(db: Db | undefined, work: (client: Queryable) => Promise<T>) => {
	try {
		return await inTransaction(db, work);
	} catch (error) {
		if (error instanceof Rollback) return error.value as T;
		throw error;
	}
};

const DAY = "to_char(day, 'YYYY-MM-DD')";

interface AvailabilityRow {
	member_id: MemberId;
	day: string;
	answer: DayAnswer['answer'];
	source: AvailabilitySource;
	updated_by: MemberId;
	updated_at: Date | string;
}

/** Everyone's answers in roster order (or just one member's). A member with no rows still appears. */
export const listAvailability = async (only?: MemberId, db?: Db): Promise<MemberAvailability[]> => {
	const { rows } = await (db ?? openDb()).query(
		`select member_id, ${DAY} as day, answer, source, updated_by, updated_at
		   from availability where ($1::text is null or member_id = $1) order by member_id, day`,
		[only ?? null]
	);
	const byMember = new Map<MemberId, MemberAvailability>(
		members.filter(m => !only || m.id === only).map(m => [m.id, { member: m.id, days: {} }])
	);

	for (const row of rows as AvailabilityRow[]) {
		byMember.get(row.member_id)!.days[row.day] = {
			answer: row.answer,
			source: row.source,
			updatedBy: row.updated_by,
			updatedAt: new Date(row.updated_at).toISOString()
		};
	}

	return [...byMember.values()];
};

export interface WriteResult {
	written: number;
	skipped: number;
}

export interface WriteOptions {
	/** Skip a day whose stored source outranks this write's source. */
	respectPrecedence: boolean;
	/** Roll everything back after counting. */
	dryRun?: boolean;
}

/** The one writer of `availability`. Changes go in date order, in one transaction. `answer: null` deletes. */
export const writeAvailability = async (
	member: MemberId,
	changes: AvailabilityChange[],
	stamp: { source: AvailabilitySource; by: MemberId },
	{ respectPrecedence, dryRun }: WriteOptions,
	db?: Db
): Promise<WriteResult> => {
	const sorted = [...changes].sort((a, b) => a.date.localeCompare(b.date));
	const sets = sorted.filter(c => c.answer !== null);
	const clears = sorted.filter(c => c.answer === null);
	const guard = respectPrecedence ? 'where source_rank(availability.source) <= source_rank(excluded.source)' : '';
	const deleteGuard = respectPrecedence ? 'and source_rank(source) <= source_rank($3)' : '';

	return inRollbackableTransaction(db, async client => {
		let written = 0;

		if (sets.length) {
			const result = await client.query(
				`insert into availability (member_id, day, answer, source, updated_by)
				 select $1, t.day, t.answer, $2, $3 from unnest($4::date[], $5::text[]) as t(day, answer)
				 on conflict (member_id, day) do update
				   set answer = excluded.answer, source = excluded.source,
				       updated_by = excluded.updated_by, updated_at = now()
				   ${guard}
				 returning day`,
				[member, stamp.source, stamp.by, sets.map(c => c.date), sets.map(c => c.answer)]
			);
			written += result.rows.length;
		}
		if (clears.length) {
			const result = await client.query(
				`delete from availability where member_id = $1 and day = any($2::date[]) ${deleteGuard} returning day`,
				respectPrecedence ? [member, clears.map(c => c.date), stamp.source] : [member, clears.map(c => c.date)]
			);
			written += result.rows.length;
		}

		const result = { written, skipped: sorted.length - written };
		if (dryRun) throw new Rollback(result);

		return result;
	});
};

// ── Failures ────────────────────────────────────────────────────────────────

const isUniqueViolation = (error: unknown) => (error as { code?: string } | undefined)?.code === '23505';

// ── Forms ───────────────────────────────────────────────────────────────────

const FORM_COLUMNS = `id, slug, title, to_char(due_day, 'YYYY-MM-DD') as due_day,
	to_char(avail_start, 'YYYY-MM-DD') as avail_start, to_char(avail_end, 'YYYY-MM-DD') as avail_end,
	practices_needed, gig_id, target_label, to_char(target_day, 'YYYY-MM-DD') as target_day, created_at, closed_at`;

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const iso = (value: Date | string) => new Date(value).toISOString();

const loadFormRow = async (client: Queryable, id: number, lock = ''): Promise<Row | undefined> =>
	(await client.query(`select ${FORM_COLUMNS} from forms where id = $1 ${lock}`, [id])).rows[0];

/** Builds the client-facing `Form`, or undefined (and logs) when this build has no handler for the slug. */
const toForm = async (client: Queryable, row: Row): Promise<Form | undefined> => {
	const handler = handlerFor(row.slug);
	if (!handler) {
		console.error(`Form ${row.id} has an unregistered slug "${row.slug}"; leaving it out.`);
		return undefined;
	}

	const { rows } = await client.query('select member_id, signed_off_at from form_members where form_id = $1', [row.id]);
	const order = members.map(m => m.id);
	const formMembers = (rows as Row[])
		.sort((a, b) => order.indexOf(a.member_id) - order.indexOf(b.member_id))
		.map(r => ({ member: r.member_id as MemberId, ...(r.signed_off_at && { signedOffAt: iso(r.signed_off_at) }) }));

	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		dueDay: row.due_day,
		createdAt: iso(row.created_at),
		...(row.closed_at && { closedAt: iso(row.closed_at) }),
		...(row.avail_start && {
			availability: {
				startDay: row.avail_start,
				endDay: row.avail_end,
				...(row.practices_needed !== null && { practicesNeeded: row.practices_needed }),
				...(row.gig_id !== null && { gigId: row.gig_id }),
				...(row.target_label !== null && { targetLabel: row.target_label }),
				...(row.target_day !== null && { targetDay: row.target_day })
			}
		}),
		members: formMembers,
		details: await handler.loadDetails(client, row.id)
	} as Form;
};

/** Open forms first, in creation order, then closed ones, newest first. Unregistered slugs are left out. */
export const listForms = async (db?: Db): Promise<Form[]> => {
	const client = db ?? openDb();
	const { rows } = await client.query(
		`select ${FORM_COLUMNS} from forms
		  order by (closed_at is not null), case when closed_at is null then id end, closed_at desc`
	);
	const forms = await Promise.all((rows as Row[]).map(row => toForm(client, row)));

	return forms.filter((form): form is Form => form !== undefined);
};

const notFound = () => failure(404, 'not-found');

/** Locks the form row and checks it's there, registered and (unless `allowClosed`) open. */
const lockOpenForm = async (client: Queryable, formId: number, lock: 'for share' | 'for update') => {
	const row = await loadFormRow(client, formId, lock);
	if (!row || !handlerFor(row.slug)) return notFound();
	if (row.closed_at) return failure(409, 'closed');

	return row;
};

const answeredDays = async (client: Queryable, member: MemberId, availability?: FormAvailability) => {
	if (!availability) return {};

	const { rows } = await client.query(
		`select to_char(day, 'YYYY-MM-DD') as day from availability
		  where member_id = $1 and day between $2::date and $3::date`,
		[member, availability.startDay, availability.endDay]
	);

	return Object.fromEntries((rows as Row[]).map(r => [r.day, true]));
};

/** Signs the member off when their form's rule is met; otherwise `409 incomplete` with what's missing. */
export const signOff = async (formId: number, member: MemberId, today: string, db?: Db): Promise<Form | Failure> =>
	inTransaction(db, async client => {
		const row = await lockOpenForm(client, formId, 'for share');
		if (isFailure(row)) return row;

		const form = (await toForm(client, row))!;
		const rule = ruleFor(form.slug)!;
		const missing = rule.missing(
			form,
			await answeredDays(client, member, form.availability),
			rule.mineOf(form, member),
			today
		);
		if (!missing.done) return failure(409, 'incomplete', missing);

		const { rowCount } = await client.query(
			'update form_members set signed_off_at = coalesce(signed_off_at, now()) where form_id = $1 and member_id = $2',
			[formId, member]
		);
		if (!rowCount) return notFound();

		return (await toForm(client, row))!;
	});

/** Saves the caller's own answers through the form's handler, under the form's share lock. */
export const saveFormAnswer = async (
	formId: number,
	member: MemberId,
	body: unknown,
	db?: Db
): Promise<Form | Failure> =>
	inTransaction(db, async client => {
		const row = await lockOpenForm(client, formId, 'for share');
		if (isFailure(row)) return row;

		const handler = handlerFor(row.slug)!;
		if (!handler.saveAnswer) return notFound();

		const saved = await handler.saveAnswer(client, (await toForm(client, row))!, member, body);
		if (isFailure(saved)) return saved;

		return (await toForm(client, row))!;
	});

export const closeForm = async (formId: number, by: MemberId, db?: Db): Promise<Form | Failure> =>
	inTransaction(db, async client => {
		const row = await lockOpenForm(client, formId, 'for update');
		if (isFailure(row)) return row;

		await client.query('update forms set closed_at = now(), closed_by = $2 where id = $1', [formId, by]);

		return (await toForm(client, (await loadFormRow(client, formId))!))!;
	});

/** Creates a scheduled practice per chosen day and closes the form, all or nothing. */
export const lockIn = async (
	formId: number,
	body: unknown,
	by: MemberId,
	today: string,
	db?: Db
): Promise<{ form: Form; practices: Practice[] } | Failure> =>
	inRollbackableTransaction(db, async client => {
		const row = await lockOpenForm(client, formId, 'for update');
		if (isFailure(row)) return row;
		if (!row.avail_start) return failure(409, 'no-availability');

		const form = (await toForm(client, row))!;
		const picked = parseLockIn(body, form, today);
		if (!picked.ok) return failure(400, picked.error);

		const { rows } = await client.query(
			`insert into practices (day, status, gig_id, form_id, created_by, updated_by)
			 select t.day, 'scheduled', $2::integer, $3::integer, $4::text, $4::text from unnest($1::date[]) as t(day)
			 on conflict (day) where status <> 'cancelled' do nothing
			 returning to_char(day, 'YYYY-MM-DD') as day`,
			[picked.value.days, row.gig_id, formId, by]
		);
		if (rows.length < picked.value.days.length) {
			const booked = new Set((rows as Row[]).map(r => r.day));
			throw new Rollback(failure(409, 'already-booked', { days: picked.value.days.filter(d => !booked.has(d)) }));
		}

		await client.query('update forms set closed_at = now(), closed_by = $2 where id = $1', [formId, by]);

		return {
			form: (await toForm(client, (await loadFormRow(client, formId))!))!,
			practices: await readPractices(client, { formId })
		};
	});

// ── Practices ───────────────────────────────────────────────────────────────

const TIME = "to_char(%s, 'HH24:MI')";

const readPractices = async (
	client: Queryable,
	{ formId, id }: { formId?: number; id?: number } = {}
): Promise<Practice[]> => {
	const { rows } = await client.query(
		`select id, to_char(day, 'YYYY-MM-DD') as day, ${TIME.replace('%s', 'start_time')} as start_time,
		        ${TIME.replace('%s', 'end_time')} as end_time, location, gig_id, status, form_id
		   from practices where ($1::integer is null or form_id = $1) and ($2::integer is null or id = $2)
		  order by day, start_time, id`,
		[formId ?? null, id ?? null]
	);
	const ids = (rows as Row[]).map(r => r.id);
	const [songs, lines] = await Promise.all([
		client.query(
			'select practice_id, title as text from practice_songs where practice_id = any($1::integer[]) order by practice_id, position',
			[ids]
		),
		client.query(
			'select practice_id, line as text from practice_recap_lines where practice_id = any($1::integer[]) order by practice_id, position',
			[ids]
		)
	]);
	const textsOf = (result: QueryResult, practiceId: number) =>
		(result.rows as Row[]).filter(r => r.practice_id === practiceId).map(r => r.text as string);

	return (rows as Row[]).map(r => {
		const prepare = textsOf(songs, r.id);
		const recap = textsOf(lines, r.id);

		return {
			id: r.id,
			date: r.day,
			...(r.start_time && { startTime: r.start_time, endTime: r.end_time }),
			...(r.location && { location: r.location }),
			...(prepare.length > 0 && { prepare }),
			...(recap.length > 0 && { recap }),
			...(r.gig_id !== null && { gigId: r.gig_id }),
			...(r.form_id !== null && { formId: r.form_id }),
			status: r.status
		};
	});
};

export const listPractices = (db?: Db) => readPractices(db ?? openDb());

type PracticeFields = Pick<PracticeInput, 'date' | 'startTime' | 'endTime' | 'location' | 'status'>;

/** The one writer of practice columns. `gigId` is set by imports only; it never changes on an ordinary save. */
export const writePracticeRow = async (
	client: Queryable,
	id: number | undefined,
	fields: PracticeFields,
	by: MemberId,
	{ gigId }: { gigId?: number } = {}
): Promise<number> => {
	const values = [
		fields.date,
		fields.startTime ?? null,
		fields.endTime ?? null,
		fields.location ?? null,
		fields.status
	];

	if (id === undefined) {
		const { rows } = await client.query(
			`insert into practices (day, start_time, end_time, location, status, gig_id, created_by, updated_by)
			 values ($1::date, $2::time, $3::time, $4, $5, $6::integer, $7::text, $7::text) returning id`,
			[...values, gigId ?? null, by]
		);
		return rows[0].id;
	}

	await client.query(
		`update practices set day = $2::date, start_time = $3::time, end_time = $4::time, location = $5, status = $6,
		        gig_id = coalesce($7::integer, gig_id), updated_by = $8, updated_at = now() where id = $1`,
		[id, ...values, gigId ?? null, by]
	);
	return id;
};

/** The one writer of a practice's songs and recap lines. */
export const replacePracticeChildren = async (
	client: Queryable,
	practiceId: number,
	prepare: string[],
	recap: string[]
) => {
	for (const [table, column, values] of [
		['practice_songs', 'title', prepare],
		['practice_recap_lines', 'line', recap]
	] as const) {
		await client.query(`delete from ${table} where practice_id = $1`, [practiceId]);
		if (values.length === 0) continue;
		await client.query(
			`insert into ${table} (practice_id, position, ${column})
			 select $1::integer, t.position, t.value from unnest($2::integer[], $3::text[]) as t(position, value)`,
			[practiceId, values.map((_, i) => i + 1), values]
		);
	}
};

const liveOnDay = async (client: Queryable, date: string, exceptId?: number): Promise<number | undefined> =>
	(
		await client.query(
			"select id from practices where day = $1::date and status <> 'cancelled' and ($2::integer is null or id <> $2)",
			[date, exceptId ?? null]
		)
	).rows[0]?.id;

const dateTaken = (practiceId: number | undefined) =>
	failure(409, 'date-taken', practiceId === undefined ? undefined : { practiceId });

/** Runs a practice write; a unique-violation race on the day becomes `409 date-taken`. */
const guardingDateTaken = async <T>(
	db: Db | undefined,
	date: string,
	exceptId: number | undefined,
	run: () => Promise<T>
) => {
	try {
		return await run();
	} catch (error) {
		if (!isUniqueViolation(error)) throw error;
		return dateTaken(await liveOnDay(db ?? openDb(), date, exceptId));
	}
};

const savePractice = async (client: Queryable, id: number | undefined, input: PracticeInput, by: MemberId) => {
	const practiceId = await writePracticeRow(client, id, input, by);
	await replacePracticeChildren(client, practiceId, input.prepare, input.recap);

	return (await readPractices(client, { id: practiceId }))[0];
};

export const createPractice = async (input: PracticeInput, by: MemberId, db?: Db): Promise<Practice | Failure> =>
	guardingDateTaken(db, input.date, undefined, () =>
		inTransaction(db, async client => {
			if (input.status === 'complete') return failure(400, 'bad-status');
			if (input.status !== 'cancelled') {
				const taken = await liveOnDay(client, input.date);
				if (taken !== undefined) return dateTaken(taken);
			}

			return savePractice(client, undefined, input, by);
		})
	);

export const updatePractice = async (
	id: number,
	input: PracticeInput,
	by: MemberId,
	db?: Db
): Promise<Practice | Failure> =>
	guardingDateTaken(db, input.date, id, () =>
		inTransaction(db, async client => {
			const stored = (await client.query('select status from practices where id = $1 for update', [id])).rows[0];
			if (!stored) return notFound();
			if (input.status === 'complete' && stored.status !== 'complete') return failure(400, 'bad-status');
			if (input.status !== 'cancelled') {
				const taken = await liveOnDay(client, input.date, id);
				if (taken !== undefined) return dateTaken(taken);
			}

			return savePractice(client, id, input, by);
		})
	);

/** Imports practices: the target is that day's row (a live one first), updated in place or inserted. */
export const importPractices = async (list: PracticeImport[], by: MemberId, dryRun: boolean, db?: Db) =>
	inRollbackableTransaction(db, async client => {
		const result = { created: 0, updated: 0 };

		for (const practice of [...list].sort((a, b) => a.date.localeCompare(b.date))) {
			if (practice.gigId !== undefined && !shows.some(show => show.id === practice.gigId)) {
				throw new Error(`Practice ${practice.date} names gigId ${practice.gigId}, which isn't in shows.ts.`);
			}

			const target = (
				await client.query(
					"select id from practices where day = $1::date order by (status = 'cancelled'), id limit 1 for update",
					[practice.date]
				)
			).rows[0]?.id;
			const id = await writePracticeRow(client, target, practice, by, { gigId: practice.gigId });
			await replacePracticeChildren(client, id, practice.prepare ?? [], practice.recap ?? []);
			result[target === undefined ? 'created' : 'updated']++;
		}

		if (dryRun) throw new Rollback(result);

		return result;
	});
