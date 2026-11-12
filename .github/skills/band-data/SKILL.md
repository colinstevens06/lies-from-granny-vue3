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

## Add a new band form (P3b)

Worked example: `march-show-planning` (migration `0003`, `src/forms/march-show-planning/`, `netlify/forms/march-show-planning.ts`).

1. Pick a slug (`^[a-z0-9-]{1,60}$`).
2. Write a migration that inserts the form row (title, due date, and any availability columns) and its `form_members` rows, plus any new tables. Quote apostrophes in text as `''`. Never edit it once a deploy has applied it.
3. Add `src/forms/<slug>/` with `model.ts` and `rules.ts` (`missing`). From P5, add `screen.vue` and `responses.vue`, built from the shared pieces.
4. Add `netlify/forms/<slug>.ts` (`loadDetails`, and `saveAnswer` if members answer), plus `mineOf` and `missing` in `rules.ts`. A form with availability should call `availabilityMissing` from `src/utils/availability.ts` in its `missing`.
5. Wire all three registries: `src/forms/rules.ts`, `netlify/forms/index.ts`, and from P5 `src/forms/index.ts`. They are typed `Record<FormSlug, …>`, so a missing one fails `yarn type-check`.
6. Extend `FormDetails` in `src/models/form.ts` (`FormSlug` follows from it).
7. Only one open form may have availability. Close the old one before a new availability form's migration runs.

## Release order

Colin releases to Anna alone first, testing on production, not a preview. Previews copy production, so they start empty.

1. Deploy. Migrations `0001`–`0003` run and the March show planning form row appears.
2. Seed production: `yarn seed:band --branch main` (dry run), then `--write`, with the database's full-write access toggle on only for that run.
3. Colin checks `/da-band`.
4. Colin invites Anna (see Identity members).

## Identity members (P2)

Pending: written when Identity is set up.
