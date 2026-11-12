import { getDatabase } from '@netlify/database';
import { members } from '../../src/components/band/members';
import type {
	AvailabilityChange,
	AvailabilitySource,
	DayAnswer,
	MemberAvailability
} from '../../src/models/availability';
import type { MemberId } from '../../src/models/band-member';

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
