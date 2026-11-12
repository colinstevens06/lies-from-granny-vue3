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

## Identity members (P2)

Pending: written when Identity is set up.
