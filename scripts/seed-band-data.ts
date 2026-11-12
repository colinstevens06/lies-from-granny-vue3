/**
 * Seeds the band database from the gitignored `band-data/import.ts`.
 *
 *   yarn seed:band                  dry run against the local database (needs `yarn netlify` running)
 *   yarn seed:band --write          commit to the local database
 *   yarn seed:band --branch main    dry run against a deployed database branch, using your Netlify CLI login
 *   yarn seed:band --branch main --write
 *
 * Or set DATABASE_URL in the shell to use any connection string. It prints the target host first.
 * Production needs the Access control toggle for full write access turned on for the run, then off again.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import type { AvailabilityImport } from '../src/models/availability';
import { expandImport } from '../src/utils/availability';
import { openDb, writeAvailability, type Db } from '../netlify/lib/band-db';

const args = process.argv.slice(2);
const write = args.includes('--write');
const branch = args.includes('--branch') ? args[args.indexOf('--branch') + 1] : undefined;

/** Local dev database (credential-free string kept in .netlify/state.json), or a branch's via the CLI. */
const connectionString = (): string => {
	if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

	if (branch) {
		const out = execFileSync(
			'yarn',
			['exec', 'netlify', 'database', 'status', '--branch', branch, '--show-credentials', '--json'],
			{ encoding: 'utf8' }
		);
		return JSON.parse(out).database.connectionString;
	}

	return JSON.parse(readFileSync('.netlify/state.json', 'utf8')).dbConnectionString;
};

/** Runs one import's availability. The shared steps of a seed: expand, write with precedence, report. */
const seedAvailability = async (db: Db, entries: AvailabilityImport[]) => {
	for (const entry of entries) {
		const answers = expandImport(entry);
		for (const member of new Set(answers.map(a => a.member))) {
			const changes = answers.filter(a => a.member === member).map(({ date, answer }) => ({ date, answer }));
			const { written, skipped } = await writeAvailability(
				member,
				changes,
				{ source: entry.source, by: 'colin' },
				{ respectPrecedence: true, dryRun: !write },
				db
			);
			console.log(`  ${entry.source} ${member}: ${written} ${write ? 'written' : 'would write'}, ${skipped} skipped`);
		}
	}
};

const main = async () => {
	const url = connectionString();
	console.log(`Target: ${new URL(url).host}${write ? ' (WRITING)' : ' (dry run; add --write to commit)'}`);

	const { availability } = (await import('../band-data/import')) as { availability: AvailabilityImport[] };
	const db = openDb(url);

	console.log('Availability');
	await seedAvailability(db, availability);
	await (db as unknown as { end?: () => Promise<void> }).end?.();
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
