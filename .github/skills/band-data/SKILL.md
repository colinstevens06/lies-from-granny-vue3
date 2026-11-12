---
name: band-data
description: 'Use when working on the /da-band database, Netlify Functions, migrations, the seed script, Identity members and roles, or adding a band form.'
user-invocable: false
---

# Band data runbook (/da-band)

The plan is `planning/2026-11-da-band-auth-plan.md`. This file records how to operate what it built, phase by phase.

## Commands

Run the Netlify CLI as `yarn exec netlify <cmd>`. `yarn netlify <cmd>` runs the package script (`netlify dev`) and ignores the command.

- `yarn netlify`: local dev (site, functions and a local Postgres). Use it for any band work.
- `yarn exec netlify database migrations apply`: apply new migrations to the local database. Production applies them on deploy.
- `yarn exec netlify database connect --query "select …"`: query the local database.
- `yarn seed:band`: dry run into the local database. `--write` commits. See Seeding.
- Gate: `yarn type-check`, `yarn lint`, `yarn build`. There is no test runner.

## Migrations (P1)

`netlify/database/migrations/<number>_<slug>.sql`, forward-only. Never edit a migration a deploy has applied; fix it with a new one. That includes a form's due date or title: add a migration with `update forms set due_day = …`.

`members` (migration 0001) must match `MemberId` in `src/models/band-member.ts` and `src/components/band/members.ts`. To add or rename a member: a new migration for the `members` row (`on update cascade` renames the references), the three code spots, and the member's Identity role.

## Seeding (P1)

`scripts/seed-band-data.ts` reads the gitignored `band-data/import.ts` (`availability: AvailabilityImport[]`). It is a dry run unless you pass `--write`, prints the target host first, and never overwrites an answer from a higher-ranked source (`self` > `manual` > `poll` > `assumed`).

- Local: `yarn seed:band` (needs `yarn netlify` running; the connection string comes from `.netlify/state.json`).
- A deployed branch: `yarn seed:band --branch main`, which gets the connection string from your Netlify CLI login. Production's Access control page gives the CLI read-only access by default, so a write needs "full write access" turned on first. Turn it on only for the run and off again afterward. Dry run first.
- Any other database: set `DATABASE_URL` in the shell.

## Forms and practices server (P3)

- Tables: `forms`, `form_members`, `practices`, `practice_songs`, `practice_recap_lines` (migration 0002). A form is created by its own migration; there is no create endpoint. Practices are never deleted; cancel them.
- Only one open form may have availability (`forms_one_open_availability`). Close the current one before a new availability form's migration runs on production, or the migration fails.
- Registries are keyed by form slug: `src/forms/rules.ts` (sign-off rule), `netlify/forms/index.ts` (server handler), and from P5 `src/forms/index.ts` (screens). A form row whose slug the running build doesn't know is logged and left out, never an error.
- Shared writers: `writePracticeRow` and `replacePracticeChildren` in `netlify/lib/band-db.ts` are the only code that writes practice columns, songs and recap lines. Extend them, don't add a second path.

### Importing practices

List them in the gitignored `band-data/import.ts` as `practices: PracticeImport[]` (same fields as `Practice`, minus `id` and `formId`), then `yarn seed:band` (dry run) and `yarn seed:band --write`. The target is that day's row (a live one first), so re-running updates in place, and marking a day `cancelled` updates the same row. `gigId` must be a `Gig.id` in `shows.ts`. `complete` is only accepted here; the editor offers tentative, scheduled and cancelled.

## Identity members (P2)

Pending: written when Identity is set up.
