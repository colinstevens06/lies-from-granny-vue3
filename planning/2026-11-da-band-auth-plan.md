# Feature: `/da-band` band tools: auth, availability, custom forms, practices (edition doc §7)

**Status:** Frozen. This is the custom-forms revision of November 10, with role-based member mapping. Review round 9's fixes are applied, and no further round is needed. Its sources:
- [`2026-11-da-band-availability-workflows.md`](2026-11-da-band-availability-workflows.md), which owns screens, copy and flows: especially "Forms are custom, built in code", "Several forms can be open at once", "The admin area is a dashboard" and Workflows F and H
- [`prototypes/2026-11-10-da-band-availability-lab.html`](prototypes/2026-11-10-da-band-availability-lab.html), for structure and copy only

This plan owns the tech and the seams.

**Track:** New feature. Risk flags:
- **Auth / ownership:** new.
- **Response newly carries data:** answers, forms, song suggestions, practices.
- **Concurrency:** primary keys, upserts and partial unique indexes.
- **Migrations:** create tables only. Existing practices come in through the seed, and a form's row comes in through that form's migration.

## Context

Members answer days Yes, No or Not sure, and everyone sees one band calendar. Colin sends **forms**. Each form is **custom, built in code**: it has its own screen and, when it needs to track something new, its own tables. Every form gives each member one to-do and one **sign-off**. Several forms can be open at once, but **only one open form may ask for availability**. When everyone has signed off that form, Colin **picks practice dates and locks them in**, which creates practices and closes the form. The first form is **March show planning**: availability for Jan 1 – Mar 31, plus "Add new songs for the March show?" with Song and Band rows. Colin edits practices on an admin page. Everything band-internal lives in **Netlify Database** (Postgres, Free plan) behind Netlify Functions that check who's calling. The repo is public.

**Phases.** All of them ship as one PR, with one commit each, in this order:

| # | Phase | Tag |
| --- | --- | --- |
| 1 | Availability server | [P1] |
| 2 | Sign-in and gate (paragraph) | [P2] |
| 3 | Forms framework and practices server | [P3] |
| 3b | March show planning: server (migration, handler, rules) | [P3b] |
| 4a | Client state, save queue, practices from the API | [P4a] |
| 4b | Admin gate, header link, dashboard, client helpers | [P4b] |
| 4c | Admin form page (state, responses, nudge, close), home admin card | [P4c] |
| 5a | Shared form pieces (availability section, week grid, weekday sheet, yes/no rows) | [P5a] |
| 5b | Form page shell, client registry, March show planning screen, to-dos | [P5b] |
| 6 | Calendar and Edit mine | [P6] |
| 7 | Pick dates, lock in | [P7] |
| 8 | Practice editor (workflow H) | [P8] |

**Not in this plan:**
- notifications
- a form builder, or any UI for creating forms
- generic question types
- anything the workflows doc lists as backlog

**Pattern reference:** none for functions. On the client, `src/utils/practices.ts` (pure helpers over arrays) and `src/components/da-band/*`.

**Decisions** (Colin, November 9–10, 2026):
- **Platform:** Netlify Database (Postgres) plus Identity with Google, invite-only, on the Free plan. The whole `/da-band` area is gated.
- **Member mapping** (November 10): through Identity **roles**. Each user gets their slug as a role, plus `admin` for Colin. All of it is set in the Netlify dashboard, and no emails go in the repo.
- **Roles:** Colin is `admin`, enforced server-side. Only the admin locks in, closes forms and edits practices. The UI never names the admin.
- **Visibility:** everyone sees everything band-internal, including every form's answers.
- **Availability answers:**
  - Answers are `yes`, `no` or `maybe` ("Not sure"). No row means unanswered.
  - Answers belong to **days**, not forms, so a new form opens pre-filled.
  - Members write dates from today (Eastern) through December 31 of next year and can't clear an answer. The admin can correct anyone's.
- **Forms are custom code.** There's no builder. A form ships with:
  - its migration, which inserts the form row and creates any tables it needs
  - a screen built from the shared pieces
  - a server handler
  - its own sign-off rule

  These are wired together by `slug` in a small code registry.
- **Several forms can be open at once.** At most one open form may have availability. Each member gets one to-do per open form they haven't signed off, in the order the forms were sent.
- **Sign-off:**
  - It's refused until the form's rule is met. For March show planning, that's every remaining day answered, plus a song answer: No, or Yes with at least one complete song.
  - Signing off never locks anything.
  - Answers save as you go and stay editable while the form is open, whatever the due date.
- **Closing a form:** a form closes on lock-in or on **Close form**, both admin actions.
- **Lock in** creates practices (time TBD, Burtonsville).
- **Practices** live in the database, imported once from `practices.ts`. The admin edits them on `/da-band/admin/practices`. Cancelling replaces deleting, and the seed is only for imports.
- **Targets:** a booked show (`gigId`), **or** a free-text `targetLabel` with an optional `targetDay`. Nothing unbooked goes into `shows.ts`.
- **Calendar:**
  - booked (pink) is a practice that isn't cancelled, or a show
  - busy (black) is any `no`, or a cancelled practice
  - possible (yellow) is five yeses with nothing booked
  - booked > busy > possible > open
  - calendars page by month from the current month through December of next year, and past days can't be tapped
- **Possible dates and the "N practices to schedule" header** come from the one open availability form. They sit above the calendar while it's open, and below it otherwise.
- **Admin area:** a dashboard of tiles, plus a page per form and the practice editor, all behind one gate. The header has an Admin link for the admin only.
- **Anna's pre-fill:**
  - yes on every Friday and Saturday, and on her long-weekend Sundays (every 14 days, Fri 2027-01-08 → Fri 2027-12-10)
  - no on every other 2027 Sunday
  - source `manual`
- **Partly filled follow-up rows stay on the device**, and only complete rows save.
- **Deploy previews** carry a copy of production data behind the same sign-in. That's accepted.
- **Members table:** ids only. The duplicated slug list was accepted.
- **Normalized tables throughout**, with no JSON.
- **Runbook skill:** written phase by phase, including "add a new band form".

**Assumptions:**
- **Practice saves never change `gig_id` or `form_id`.**
- **The editor offers three statuses:** tentative, scheduled and cancelled. `complete` comes only from the import, and an update keeps a stored `complete`.
- **March show planning values:** `practices_needed = 3` (from the prototype) and `target_label = 'the March show'`. **Its `due_day` is set by Colin when it's built.** The build session asks for it, and it must be on or after the deploy date.
- **Member ids are slugs.** Timestamps are ISO UTC instants. Band dates are Eastern `'YYYY-MM-DD'` strings, and practice times are Eastern `'HH:MM'` strings.

## Grounding

All ✅ rows were verified on November 10, with 0 ❌.

| Symbol | Location | Verified |
| --- | --- | --- |
| `Practice` (`id`, `date`, `startTime?`, `endTime?`, `location?`, `prepare?`, `recap?`, `gigId?`, `status`) | `src/models/practice.ts:1-20` | ✅ |
| `practices`: imported only by `da-band.vue:33` and `da-band-history.vue:34`; `Practice.id` used only as `:key` | `src/components/da-band/practices.ts:6` | ✅ |
| `upcomingPractices(practices, now)` (includes cancelled), `practiceHistory`, `PRACTICE_HOME`, `practiceLocation`, `practiceGig`; **this file uses path aliases** | `src/utils/practices.ts:1-4,15,19,31,33,36` | ✅ |
| `Gig.id: number`; `shows` (only an `import type`, so functions can import it) | `src/models/gig.ts:2`, `src/components/shows/shows.ts:1,3` | ✅ |
| `easternNow`, `formatCalendarDate`, `daysBetween` (`dates.ts` has no imports) | `src/utils/dates.ts:25,36,47` | ✅ |
| `da-band`, `da-band-history` routes; noindex for `/da-band/*` | `src/router/index.ts:42-50`, `public/_headers:2-5` | ✅ |
| reused: `practice-card`, `practice-details`, `practice-status-badge`, `next-gig`; `band-card*` and `band-link`; `$lfg-pink`, `$lfg-poster-yellow` | `src/components/da-band/`, `_da-band.scss`, `_variables.scss:3,6` | ✅ |
| PrimeVue 3.32.2 with per-component imports; Pinia registered; `index.scss` imports partials; `nav.vue` | `nav.vue:54-55`, `main.ts:18-20`, `index.scss:47-58` | ✅ |
| TypeScript `~4.7.4`, `moduleResolution: node`, `include` covers only `src/**` | `tsconfig.json:3,16` | ✅ (see the pre-flight) |
| `netlify database` CLI; migrations `netlify/database/migrations/<n>_<slug>.sql` (forward-only, applied on deploy) | netlify-cli 27.4.2; Netlify docs | ✅ / ⚠️ |
| `@netlify/database` (`getDatabase`, `db.sql`, `db.pool`); `@netlify/identity` `getUser()` | Netlify docs | ⚠️ not installed |
| Netlify site link | absent | ❌ (see the pre-flight) |

**Pre-flight, before P1:**
1. Run `yarn netlify link`.
2. Confirm the account is on the credit-based Free plan.
3. Create the database with direct SQL.
4. Add `@netlify/identity`, `@netlify/database`, `@netlify/functions` and `tsx` (dev).
5. Extend `include` (contract 12). Bump to TypeScript 5 with `moduleResolution: "bundler"` if the imports don't resolve, in its own commit, first.
6. Find where the production connection string lives.
7. Re-check Identity's status.

Stop and ask Colin if step 2, 6 or 7 fails.

## Implementation Freeze (Launch This, Do Not Re-Plan): server, P1, P3 and P3b

1. **Roster** [P1].
   - `src/models/band-member.ts` has `MemberId` (with a comment pointing to migration `0001`), `BandRole`, `BandMember` and `CurrentMember = { member: MemberId; role: 'admin' | 'member' }`.
   - `src/components/da-band/members.ts` has `members: BandMember[]`.
   - No emails.

2. **Models.** Optional fields are omitted from JSON, and `null` appears nowhere in responses.
   - **[P1] `src/models/availability.ts`:** `Answer`, `AvailabilitySource = 'self' | 'poll' | 'manual' | 'assumed'`, `DayAnswer { answer; source; updatedBy; updatedAt }`, `MemberAvailability { member; days: Record<string, DayAnswer> }`, `AvailabilityChange { date; answer: Answer | null }` and `AvailabilityImport` (contract 11).
   - **[P3] `src/models/form.ts`:**
     ```ts
     export interface FormAvailability { startDay: string; endDay: string; practicesNeeded?: number; gigId?: number; targetLabel?: string; targetDay?: string }
     export interface FormBase { id: number; slug: FormSlug; title: string; dueDay: string; createdAt: string; closedAt?: string;
       availability?: FormAvailability;
       members: { member: MemberId; signedOffAt?: string }[] }  // roster order
     export type Form = FormBase & { details: FormDetails };      // details are per form, by slug
     ```
     `FormSlug` and `FormDetails` are unions with one member per registered form. P3b adds the first:
   - **[P3b] `src/forms/march-show-planning/model.ts`:**
     ```ts
     export interface SongSuggestion { title: string; artist: string }
     export interface SongPitch { member: MemberId; wantsNew: boolean; answeredAt: string; songs: SongSuggestion[] } // songs in position order
     export interface MarchShowPlanningDetails { slug: 'march-show-planning'; songPitches: SongPitch[] }
     export interface SongPitchInput { wantsNew: boolean; songs?: SongSuggestion[] }
     ```
   - **[P3] `src/models/practice.ts`** (existing) gains `formId?: number`, plus:
     - `PracticeInput = { date; startTime?; endTime?; location?; status: 'tentative' | 'scheduled' | 'cancelled' | 'complete'; prepare: string[]; recap: string[] }`, the editor's whole-record body. `complete` is accepted only as described in contract 7.
     - `PracticeImport = Omit<Practice, 'id' | 'formId'>`.

3. **Schema.** `→members` means `text not null references members(id) on update cascade`. Ids are `integer` identity columns, so the driver returns numbers.
   - **`0001_band_availability.sql` [P1]:**
     ```sql
     -- Member ids. Must match MemberId in src/models/band-member.ts.
     create table members (id text primary key);
     insert into members (id) values ('anna'),('kyle'),('nick'),('francesco'),('colin');
     create function source_rank(source text) returns int language sql immutable as $$
       select case source when 'self' then 4 when 'manual' then 3 when 'poll' then 2 when 'assumed' then 1 end $$;
     create table availability (
       member_id →members, day date not null,
       answer text not null check (answer in ('yes','no','maybe')),
       source text not null check (source_rank(source) is not null),
       updated_by →members, updated_at timestamptz not null default now(),
       primary key (member_id, day));
     ```
   - **`0002_band_forms_practices.sql` [P3]:**
     ```sql
     create table forms (
       id integer generated always as identity primary key,
       slug text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),  -- maps to the code registry
       title text not null check (length(title) between 1 and 80), due_day date not null,
       avail_start date, avail_end date,
       practices_needed smallint check (practices_needed between 1 and 5),
       gig_id integer, target_label text check (length(target_label) between 1 and 80), target_day date,
       created_by →members, created_at timestamptz not null default now(),
       closed_by text references members(id) on update cascade, closed_at timestamptz,
       check ((avail_start is null) = (avail_end is null)),
       check (avail_start is null or (avail_start <= avail_end and avail_end - avail_start < 400)),
       check (avail_start is not null or (practices_needed is null and gig_id is null and target_label is null and target_day is null)),
       check (gig_id is null or (target_label is null and target_day is null)),
       check ((closed_at is null) = (closed_by is null)));
     create unique index forms_one_open_availability on forms ((true)) where closed_at is null and avail_start is not null;
     create table form_members (
       form_id integer not null references forms(id) on delete cascade, member_id →members,
       signed_off_at timestamptz, primary key (form_id, member_id));
     create table practices (
       id integer generated always as identity primary key,
       day date not null, start_time time, end_time time, location text, gig_id integer,
       status text not null check (status in ('tentative','scheduled','cancelled','complete')),
       form_id integer references forms(id),
       created_by →members, created_at timestamptz not null default now(),
       updated_by →members, updated_at timestamptz not null default now(),
       check ((start_time is null) = (end_time is null)));
     create unique index practices_one_live_per_day on practices (day) where status <> 'cancelled';
     create table practice_songs (practice_id integer not null references practices(id) on delete cascade,
       position smallint not null, title text not null, primary key (practice_id, position));
     create table practice_recap_lines (practice_id integer not null references practices(id) on delete cascade,
       position smallint not null, line text not null, primary key (practice_id, position));
     ```
   - **`0003_form_march_show_planning.sql` [P3b]:**
     ```sql
     create table song_pitches (
       form_id integer not null references forms(id) on delete cascade, member_id →members,
       wants_new boolean not null, answered_at timestamptz not null default now(),
       primary key (form_id, member_id));
     create table song_suggestions (
       form_id integer not null, member_id text not null, position smallint not null,
       title text not null check (length(title) between 1 and 120),
       artist text not null check (length(artist) between 1 and 120),
       primary key (form_id, member_id, position),
       foreign key (form_id, member_id) references song_pitches on delete cascade);
     insert into forms (slug, title, due_day, avail_start, avail_end, practices_needed, target_label, created_by)
       values ('march-show-planning', 'March show planning', '<due day from Colin>', '2027-01-01', '2027-03-31', 3, 'the March show', 'colin');
     insert into form_members (form_id, member_id) select f.id, m.id from forms f cross join members m where f.slug = 'march-show-planning';
     ```
     - **Replace `<due day from Colin>` with a literal date before the first commit.** Left as is, the placeholder makes the migration fail.
     - **Once any preview deploy has applied `0003`, it's never edited.** A later date fix goes in a new migration (`0004 … update forms set due_day = …`). There's no UI for changing a due date.
   - **Notes:**
     - Availability is just nullable columns on `forms`, since a form has it or doesn't, and the checks keep those columns all-or-nothing.
     - `forms_one_open_availability` makes "one open availability form" a database rule.
     - `song_pitches` and `song_suggestions` keep the songs as band data that a future set-list feature can read.
     - `gig_id` is checked in code against `shows`.

4. **Dates and SQL hygiene.**
   - Dates, times and timestamps leave SQL as text (`to_char(…, 'YYYY-MM-DD')`, `to_char(…, 'HH24:MI')`), and timestamps go out through `toISOString()`.
   - "Today" is `easternNow().slice(0, 10)`, passed in.
   - Every value is a parameter. Writes run in one transaction, sorted by key.

5. **Shared pure code**, with relative imports only and no I/O.
   - **[P1] `src/utils/availability.ts`:**
     - `parseAvailabilityChanges(body, { today, memberLimits })`; `memberLimits` gives `400 date-out-of-range` outside today → December 31 of next year
     - `expandImport`
     - **`availabilityMissing(availability, myDays, today)`** returns `{ missingDays; firstMissing? }` over `[max(startDay, today), endDay]`. Every form with availability uses it in its sign-off rule.
   - **[P3] `src/utils/forms.ts`:** `parseLockIn(body, form, today)`, which checks for one or more distinct days, each inside the form's availability and on or after today.
   - **[P3] `src/utils/practice-input.ts`:**
     - `parsePracticeInput` checks:
       - a real date
       - `HH:MM` times, both or neither, with end after start
       - `location` trimmed, 1–80 characters, where empty means omitted
       - the status
       - up to 30 songs of 1–120 characters
       - up to 30 recap lines of 1–300 characters
     - `parsePracticeImport` reuses the same checks.
   - **[P3b] `src/forms/march-show-planning/rules.ts`:**
     - **`parseSongPitch(body)`:** `wantsNew: false` has no songs; `wantsNew: true` takes 0–20 songs, each with a trimmed `title` and `artist` of 1–120 characters.
     - **`missing(form, myDays, myPitch, today)`** returns `{ missingDays, firstMissing?, songsMissing: boolean }`. `songsMissing` is true when there's no pitch, or when `wantsNew` has 0 songs.
   - **[P3b] `src/forms/rules.ts`**, the shared rule registry: `formRules: Record<FormSlug, { mineOf(form: Form, member): unknown; missing(form, myDays, mine, today): { done: boolean; … } }>`.
     - `mineOf` picks the member's own answers out of `form.details`.
     - **The server's sign-off and the client's Sign off button both call `mineOf`, then `missing`, on the same `Form` shape**, so they can't disagree.
     - `src/forms/rules.ts` and every `src/forms/<slug>/{model,rules}.ts` import no `.vue` files and nothing from `src/forms/index.ts`.

6. **Identity seam** [P1]: `netlify/lib/current-member.ts` is the only importer of `@netlify/identity`. It provides `getCurrentMember()` and `requireAdmin()`.
   - **Members map through Identity roles**, because the dashboard can set roles but not custom `app_metadata` fields.
     - Each user has their slug as a role (`nick`), and Colin also has `admin`.
     - `getCurrentMember()` reads `user.roles` (`app_metadata.roles`) and keeps the roles that are known `MemberId`s.
     - Exactly one gives `{ member, role: roles.includes('admin') ? 'admin' : 'member' }`. None, or more than one, gives `'not-a-member'`.
     - Any other role is ignored.
   - Role changes take effect at the user's next token refresh, which is up to an hour, or right away if they sign out and back in.

7. **Database seam:** `netlify/lib/band-db.ts` is the only importer of `@netlify/database`. Every export takes an optional `db`.
   - **[P1] `listAvailability()`.**
   - **[P1] `writeAvailability(member, changes, stamp, { respectPrecedence, dryRun? })`:**
     - It upserts `on conflict (member_id, day) do update set answer, source, updated_by, updated_at = now()`.
     - `respectPrecedence` adds `where source_rank(availability.source) <= source_rank(excluded.source)`.
     - `null` is a delete, with the same guard.
     - Changes are sorted by date, in one transaction.
     - It returns `{ written, skipped }` from `returning`.
     - `dryRun` rolls back.
   - **[P3] `listForms()`:** open forms first, in creation order, then closed ones, newest first. Each form gets its `details` from the server registry (contract 8), and unregistered slugs are left out.
   - **[P3] `signOff(formId, member, today)`**, in one transaction:
     1. Lock the form row `for share` (`404`, or `409 closed`).
     2. Read the caller's days in range (at most 400), and build the form's `details` with the handler's `loadDetails`.
     3. Call `formRules[slug].mineOf`, then `missing`. It returns the missing result, or sets `signed_off_at = coalesce(signed_off_at, now())`.
   - **[P3] `lockIn(formId, body, by)`**, in one transaction:
     1. Lock the form `for update`. It must be open (`409 closed`) with availability (`409 no-availability`).
     2. Run `parseLockIn` (`400`).
     3. Insert with `insert into practices … on conflict (day) where status <> 'cancelled' do nothing returning day`, using `status 'scheduled'`, no time or location, the form's `gig_id`, and `form_id`.
     4. If fewer days come back than were requested, roll back and return `{ error: 'already-booked', days }`.
     5. Otherwise close the form.
   - **[P3] `closeForm(formId, by)`.**
   - **[P3] Practice writes:**
     - `writePracticeRow(client, id | undefined, fields, by, { gigId? })` is the **one** writer of practice columns.
     - `replacePracticeChildren(client, practiceId, prepare, recap)` is the **one** writer of songs and recap lines.
     - `listPractices()`.
     - `importPractices(list, by, dryRun)`: the target is the row for that day, preferring one that isn't cancelled, selected `for update`, and it's updated or inserted.
     - **`createPractice(input, by)`** and **`updatePractice(id, input, by)`**:
       - `updatePractice` locks the row `for update` (`404`).
       - A live input checks for another live practice that day (`409 { error: 'date-taken', practiceId? }`).
       - A `23505` is caught after rollback, re-queried, and mapped to the same `409`.
       - `complete` is accepted only when the stored row is already `complete`.
       - Neither touches `gig_id` or `form_id`.

8. **Server form registry** [P3, P3b]: `netlify/forms/index.ts` maps `slug` to a handler.
   ```ts
   interface FormHandler<D> {
     loadDetails(client, formId): Promise<D>;                       // everyone's answers, for GET
     saveAnswer?(client, form, member, body): Promise<D | { error: string; status: number }>; // own answers only
   }
   ```
   - **[P3b] `netlify/forms/march-show-planning.ts`:**
     - `loadDetails` reads `song_pitches` plus `song_suggestions` in position order.
     - `saveAnswer` runs `parseSongPitch`, upserts `song_pitches` with `answered_at = now()`, then deletes and reinserts that member's `song_suggestions`, in one transaction under the form's `for share` lock.
   - **A form row whose slug isn't registered** (an old preview branch, or after a rollback) is **logged and left out** of `listForms` and every form endpoint (`404`). It never breaks the other forms.
   - **All three registries** (`src/forms/rules.ts`, `src/forms/index.ts`, `netlify/forms/index.ts`) are typed `Record<FormSlug, …>`, so a missing registration fails `yarn type-check`.

9. **Endpoints.** Every route is member-gated: `401 signed-out` and `403 not-a-member`.

   | Method and path | Who | Body | Success | Errors |
   | --- | --- | --- | --- | --- |
   | `GET /api/band/me` [P1] | member | — | `{ member, role }` | — |
   | `GET /api/band/availability` [P1] | member | — | `{ members }` | — |
   | `PATCH /api/band/availability/:member` [P1] | self, or admin for anyone | `{ changes, source? }` | `{ availability }` | `403 not-yours`; `400` (parse error, `date-out-of-range` for non-admins, "can't clear an answer") |
   | `GET /api/band/forms` [P3] | member | — | `{ forms: Form[] }` | — |
   | `PUT /api/band/forms/:id/answers` [P3] | the caller's own row | the handler's body | `{ form }` | `404` (no form, or no `saveAnswer`), `409 closed`, `400` |
   | `POST /api/band/forms/:id/sign-off` [P3] | the caller's own row | `{}` | `{ form }` | `409 { error: 'incomplete', …missing }`, `409 closed`, `404` |
   | `POST /api/band/forms/:id/lock-in` [P3] | admin | `{ days }` | `{ form, practices }` | `403`, `404`, `409 closed`, `409 no-availability`, `409 { error: 'already-booked', days }`, `400` |
   | `POST /api/band/forms/:id/close` [P3] | admin | `{}` | `{ form }` | `403`, `404`, `409 closed` |
   | `GET /api/band/practices` [P3] | member | — | `{ practices }` | — |
   | `POST /api/band/practices` [P3] | admin | `PracticeInput` | `201 { practice }` | `403`, `409 date-taken`, `400` |
   | `PUT /api/band/practices/:id` [P3] | admin | `PracticeInput` (whole record) | `{ practice }` | `403`, `404`, `409 date-taken`, `400` |

   - **No form-creation endpoint and no practice delete.** A form is created by its migration, and cancelling replaces deleting.
   - **Availability stamp:** `self` for your own row. The admin writing someone else's row uses `source ?? 'manual'` with `respectPrecedence: false`.

10. **Hardening**, in every function.
    - `Cache-Control: private, no-store`.
    - Check order: method → Origin and JSON content type on writes (`403 bad-origin`) → path shape only, with no database access → identity → role → body shape (`400`) → database lookups (`404`/`409`) → validation that needs the looked-up row (`parseLockIn`, the handler's parse; `400`).
    - An unauthenticated request never reaches the database.

11. **Seed** [P1, extended in P3]: `yarn seed:band` (`tsx scripts/seed-band-data.ts`).
    - It reads the gitignored `band-data/import.ts`, which exports `availability: AvailabilityImport[]` and `practices: PracticeImport[]`.
    - Dry run is the default, and `--write` commits.
    - It needs `DATABASE_URL` from the shell only, and prints the host first.
    - **Availability import format:**
      ```ts
      export interface AvailabilityImport {
      	source: 'poll' | 'manual' | 'assumed';
      	/** In-window dates a listed member didn't list become 'no'; `busyWeekdays` narrows that to those weekdays. */
      	window?: { start: string; end: string; busyWeekdays?: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> };
      	members: Partial<Record<MemberId, string[]>>; // 'yes' dates; absent member untouched
      }
      ```
    - **Availability writes:** `respectPrecedence: true`, `updatedBy: 'colin'`. `expandImport` returns unique dates, and an explicit yes beats a window no.
    - **Anna's entry:** `source: 'manual'`, window 2027-01-01 → 2027-12-31, `busyWeekdays: ['sun']`. Her yes list is every Friday and Saturday plus her long-weekend Sundays.
    - **Practices** [P3]: through `importPractices`. The first run imports today's `practices.ts`.

12. **Type-checking:** `include` gains `netlify/**/*.ts`, `scripts/**/*.ts` and `band-data/**/*.ts`.

## Implementation Freeze (Launch This, Do Not Re-Plan): client, P4a–P8

Use PrimeVue 3 (per-component imports) and project SCSS, never the prototype's CSS. Follow `~/.claude/rules/layout.md`: sticky bars use `position: sticky` in normal flow. Copy and layout follow the workflows doc and the prototype; these contracts own the seams. In the UI the action is **"Sign off"**.

U1. **Store** [P4a]. Phase 2 creates `me` and `loadMe()`. The store is `src/stores/band.ts` (`useBandStore`), the only client holder of server data.
   - **State:** `availability`, `forms`, `practices`, `loadState`, `saving`, and `drafts` (U2).
   - **Getters:**
     - `openForms`: in creation order
     - `availabilityForm`: the one open form with `availability`
     - `myTodos`: open forms I haven't signed off, in creation order
     - `everyoneIn(form)`
   - **`load()`** fetches availability, forms and practices in parallel. Every `/da-band*` view calls it on mount.
   - **Merge rule:**
     - My availability and my form answers apply only if `saveVersion` hasn't changed since the load started.
     - Pending keys keep their local value.
     - Everything else always applies.
   - **`src/utils/band-api.ts`** is the only `fetch` for `/api/band/*`. It sends JSON, sends `{}` for body-less POSTs, and on `401` routes to `da-band-login`.
   - **Practices come from the store.** `da-band.vue` and `da-band-history.vue` read `band.practices`, and `src/components/da-band/practices.ts` is deleted.
   - **Lazy imports.** Because `nav.vue` imports the store, the store imports `band-api` and `band-calendar` lazily, or only inside actions.

U2. **Save queue** [P4a]. `src/composables/use-save-lane.ts` is written once and used for two lanes, with the same rules for both.
   - **Lane: availability.** `band.setMyAnswers(changes)` is keyed by date. It's flushed 400 ms after the last change, or immediately for a weekday fill, as `PATCH` chunks of at most 400.
   - **Lane: form answers.** `band.setMyFormAnswer(formId, body)` is keyed by form, and the latest whole body wins. It's flushed 600 ms after the last change as `PUT /api/band/forms/:id/answers`.
   - **Shared rules:**
     - **Pending** means queued or in flight, with one request in flight per lane.
     - **Success:** `saveVersion` goes up by one, the response replaces that key, and pending keys are reapplied.
     - **Network failure or 5xx:** the batch goes back in the queue (a newer value wins), "Not saved yet. Retrying…" shows, and it retries after 2, 4 and 8 seconds, then every 30 seconds, with any change retrying at once.
     - **Any other 4xx:** that batch is dropped, `load()` runs, and "Couldn't save that. Your answers were reloaded." shows.
     - **401:** it goes to login.
   - **`saving`** blocks Sign off and triggers a `beforeunload` prompt.
   - **`drafts`** (partly filled follow-up rows, keyed by form) live only on the device. `load()` never touches them, but `beforeunload` warns about them too.

U3. **Pure helpers** [P4b]: `src/utils/band-calendar.ts`.
   - **Answers:** `nextAnswer` maps blank → yes → no → maybe → yes. `ANSWER_LABEL` holds the labels, with "Pending" for none.
   - **Ranges:** `weeksInRange`, `monthsFrom(today)` (through December of next year), `toIsoDay(Date)` (local getters).
   - **Status:** `calendarDayStatus(date, availability, practices, shows)`.
   - **`targetOf(form, shows)`** returns the gig if it's in `shows` and hasn't passed, else `targetLabel`/`targetDay`, else `undefined`.
   - **Possible dates:** `possibleDates(availabilityForm?, …)` stops before the target day, or stays inside the form's range when there's no target day. With no open availability form, it covers all upcoming dates.
   - **`practicesStillNeeded(form, practices, shows)`.**
   - **`pickGroups(form, availability, practices, today)`.**
   - **`prefilledCount(form, myDays)`.**
   - **Copy texts:** `inviteText(form)`, `nudgeText(form, waiting)`, `possibleListText`.

U4. **Client form registry** [P5b]: `src/forms/index.ts` maps `slug` to `{ title, screen, responses, todoLines }`.
   - `screen` and `responses` are lazy components.
   - `todoLines(form, mine)` returns the to-do card's per-section lines ("45 of 90", "Already on your calendar ✓", "Not answered", "Answered ✓").
   - **A form whose slug isn't registered on the client shows "This form needs an app update."** It's never a crash.

U5. **Routes**, each with `meta: { requiresMember: true }`.
   - **Admin routes**, all rendered inside **`admin-gate.vue`** [P4b]: loading while `me` is undefined, only "Access denied" and a link back for a non-admin, the slot for the admin. The server is the real gate.
     - `/da-band/admin` (`da-band-admin`): the dashboard [P4b]
     - `/da-band/admin/forms/:id(\\d+)` (`da-band-admin-form`): one form [P4c]. An unknown id shows "No such form."
     - `/da-band/admin/practices` (`da-band-admin-practices`) [P8]
     - Each sub-page has **← Admin**.
   - **`/da-band/form/:id(\\d+)`** (`da-band-form`) [P5b]: an unknown or closed form shows "That form isn't open." with a link back.
   - **`/da-band/edit`** (`da-band-edit`) [P6].
   - **Header link** [P4b]: `nav.vue` shows **Admin** when `band.me?.role === 'admin'`. It only reads `band.me` and never calls the API, and sign-out clears `band.me`.

U6. **Admin pages.** Copy and layout follow "The admin area is a dashboard".
   - **Dashboard** [P4b]: `da-band-admin.vue`, made of `admin-tile.vue` cards (a title, a body slot and a link). More tools get new tiles later.
     - **Forms:** one tile per open form in creation order, then **Past forms**. There's **no "+ New form"**.
     - Each tile shows the title, a short line for its sections (from the registry's `title` and `availability`), the due date, a state pill ("{k} of 5 signed off", "Everyone's in · pick dates" when it has availability, "Closed"), and `signed-off-dots.vue`.
     - **Practices tile** [P8]: the next practice, "{n} upcoming", and "{m} need a time".
   - **Form page** [P4c, P7]: `da-band-admin-form.vue`.
     - **The action for its state:**
       - **Open:** **Copy a nudge**, and **Close form**, which asks for confirmation.
       - **Everyone's in, with availability:** `pick-dates.vue` [P7].
       - **Closed:** a summary, plus any practices whose `formId` matches.
     - **Responses:** the shared **`form-responses.vue`** (one row per member: signed off or not, and "{answered} of {N} dates" when the form has availability), followed by the registry's `responses` component for that form.
     - **What this form asks:** a read-only list from the registry's `screen` metadata.
     - **No new API:** `GET /api/band/forms` returns everything.

U7. **Form page and shared pieces** [P5a, P5b]: `da-band-form.vue` is the shell.
   - **Shell:** the title, the due line, the registry's `screen` component, one sticky progress line, and one sticky **Sign off** bar.
   - **Sign off:**
     - It's enabled when `formRules[slug].missing(...)` reports done and `!saving`, both rechecked at click time.
     - A `409 incomplete` runs `load()` and scrolls to the first missing item.
     - A `409 closed` shows "This form just closed." and goes home.
   - **Shared pieces for building forms**, in `src/components/da-band/forms/`:
     - **`availability-section.vue`:** the pre-fill note, "Fill a weekday at once…" (`weekday-fill-sheet.vue`, a bottom `Sidebar` that fills only blank days in range from today on), and `week-grid.vue` of `answer-cell.vue` cells, with past days untappable. It's driven by `form.availability`.
     - **`yes-no-rows.vue`:** a prompt, then **Yes / No**, then on Yes ordered rows of labeled inputs with **+ Add another** when several are allowed. Its props are `prompt`, `fields: string[]` and `allowSeveral`, and it emits a complete-rows value. A partly filled row stays in `drafts` and shows "Fill in every field to save this one." Choosing No clears rows, after a confirmation if there were any.
     - **`form-todo-card.vue`:** the title, the due date and overdue state, the registry's `todoLines`, and a **Check and sign off** variant when nothing is missing.
   - **March show planning** (`src/forms/march-show-planning/screen.vue`):
     - an `availability-section`
     - `yes-no-rows` with "Add new songs for the March show?" and the fields **Song** and **Band**, several allowed, saved through `setMyFormAnswer` as `{ wantsNew, songs: [{ title, artist }] }`
     - its `responses.vue` lists every song as "{title} – {artist} ({short})"

U8. **Home `/da-band`** [P4a–P7]. Sections that need the API show "Loading…", and "Couldn't load." with **Retry** on error.
   - **Order:**
     1. one `form-todo-card` per `myTodos` entry [P5b]
     2. for the admin, one `form-status-card.vue` per open form [P4c] (dots, who's waiting, **Copy a nudge**, and, once everyone's in on the availability form, **Pick practice dates** → `da-band-admin-form`) [P7]; for everyone, "Everyone's in" on the availability form [P7]
     3. Next practice and Next gig
     4. **Possible dates** when there's an `availabilityForm` [P6]
     5. Band calendar [P6]
     6. **Possible dates** here instead when there's no `availabilityForm`
     7. each open form's registry `responses` [P5b]
     8. Upcoming practices and history

U9. **Pick dates** [P7]: `pick-dates.vue` on `da-band-admin-form`.
   - Groups from `pickGroups`: **Everyone said Yes**, and **One short** ("no {short}").
   - Tapping toggles a pick, with "{n} of {practicesNeeded} picked". Going over is allowed.
   - A sticky **Lock in {n}** bar.
   - **Success:** `load()` runs, and the page shows the closed summary.
   - **`409 already-booked`:** `load()` runs, the named days are dropped, and "Already booked: {days}" shows.

U10. **Calendars** [P6].
   - `month-grid.vue` pages one month at a time over `monthsFrom(today)`, opens on the current month and stops at both ends. A month inside `availabilityForm` is labeled "In the {title} form".
   - **Band calendar:** `calendar-day.vue` shows the status fill plus five member dots. Tapping opens `day-answers-sheet.vue`, with the near-miss line.
   - **Edit mine** (`da-band-edit.vue`): `answer-cell.vue` with `nextAnswer`, for any future date.
   - Past days are dimmed and untappable.

U11. **Practice editor** [P8]: `da-band-admin-practices.vue` with `practice-editor.vue`, following workflow H.
   - **List:** `upcomingPractices(band.practices)`, showing the time or "Time TBD", `practiceLocation`, and `practice-status-badge.vue`. **+ Add a practice** opens an empty editor.
   - **Editor fields:** date; start and end time (both or neither); location (empty means the default); status as a `SelectButton` (Tentative, Scheduled, Cancelled, with `complete` shown but never offered); songs (an ordered list); recap lines.
   - **Save** calls `band.savePractice(input, id?)`, a `POST` or `PUT` through `band-api` (not the save queue), disabled while in flight.
     - **Success:** it replaces the practice in the store, and the editor closes.
     - **`409 date-taken`:** "Another practice is already on {date}."
     - **`400`:** shows the error text.
   - **Cancel** discards the edits. There's a `beforeunload` prompt while there are unsaved edits.

U12. **Reuse**, one of each.
   - **Kept as is:** `practice-card`, `practice-details`, `practice-status-badge`, `next-gig`, the `band-card*` and `band-link` classes, `upcomingPractices` and `practiceLocation`, `members`, `shows`.
   - **New shared components:** `copy-button`, `month-grid`, `answer-cell`, `admin-gate`, `admin-tile`, `signed-off-dots`, `form-responses`, `availability-section`, `yes-no-rows`, `form-todo-card`.
   - **Shared rules** (client and server): `formRules`, `availabilityMissing`.
   - **Colors and styles:** new color variables go in `_variables.scss`, with possible set to `$lfg-poster-yellow` and booked to `$lfg-pink`. Styles go in `_band-availability.scss`, **imported in `index.scss`**.

U13. **Execute this plan.** Do not recreate or redesign this planning document during implementation.

## Agent Orchestration

There are no specialist agents, so the building session does each phase, one commit each.

| Phase | Files (new unless noted) |
| --- | --- |
| P1 | `src/models/band-member.ts`, `src/components/da-band/members.ts`, `src/models/availability.ts`, `src/utils/availability.ts`, migration `0001`, `netlify/lib/current-member.ts`, `netlify/lib/band-db.ts`, `netlify/functions/band-me.ts`, `netlify/functions/band-availability.ts`, `scripts/seed-band-data.ts`; edits to `package.json`, `tsconfig.json`, `.gitignore` |
| P3 | `src/models/form.ts`, `src/utils/forms.ts`, `src/utils/practice-input.ts`, migration `0002`, `netlify/forms/index.ts`, `netlify/functions/band-forms.ts`, `netlify/functions/band-practices.ts`; edits to `src/models/practice.ts`, `band-db.ts`, the seed |
| P3b | `src/forms/march-show-planning/model.ts`, `src/forms/march-show-planning/rules.ts`, `src/forms/rules.ts`, migration `0003`, `netlify/forms/march-show-planning.ts`; edits to `src/models/form.ts` (the union) and `netlify/forms/index.ts` |
| P4a | `src/stores/band.ts` (edit), `src/utils/band-api.ts`, `src/composables/use-save-lane.ts`; edits to `da-band.vue` and `da-band-history.vue`; delete `src/components/da-band/practices.ts` |
| P4b | `src/utils/band-calendar.ts`, `admin-gate.vue`, `admin-tile.vue`, `signed-off-dots.vue`, `copy-button.vue`, `da-band-admin.vue`; edits to the router, `nav.vue`, SCSS (the new partial and `index.scss`) |
| P4c | `da-band-admin-form.vue`, `form-responses.vue`, `form-status-card.vue`; edits to the router, `da-band.vue` |
| P5a | `availability-section.vue`, `week-grid.vue`, `answer-cell.vue`, `weekday-fill-sheet.vue`, `yes-no-rows.vue` (in `src/components/da-band/forms/`) |
| P5b | `src/forms/index.ts`, `src/forms/march-show-planning/screen.vue`, `src/forms/march-show-planning/responses.vue`, `form-todo-card.vue`, `da-band-form.vue`; edits to the router, `da-band.vue`, `da-band-admin-form.vue` |
| P6 | `month-grid.vue`, `calendar-day.vue`, `day-answers-sheet.vue`, `possible-dates.vue`, `da-band-edit.vue`; edits to the router, `da-band.vue` |
| P7 | `pick-dates.vue`; edits to `da-band-admin-form.vue`, `form-status-card.vue`, `da-band.vue` |
| P8 | `da-band-admin-practices.vue`, `practice-editor.vue`; edits to the router, the store, `da-band-admin.vue` (the Practices tile) |

**Runbook** (`.claude/skills/band-data/SKILL.md`, part of each phase):
- **P1:** local dev and migrations, the seed, the production `DATABASE_URL`, the promote path, adding or renaming a member, and the commands in `CLAUDE.md`.
- **Fixing a form's due date or title:** a new forward migration.
- **P2:** inviting a member: invite their Google address in the Identity dashboard, then give them exactly one slug role (and `admin` for Colin only). Renaming a member also means renaming their role.
- **P3:** importing practices.
- **P3b and P5b: "Add a new band form"**, step by step:
  1. Pick a slug.
  2. Write a migration that inserts the form row (title, due date, any availability columns), its `form_members` rows, and any new tables.
  3. Add `src/forms/<slug>/` with `model.ts`, `rules.ts` (`missing`), `screen.vue` and `responses.vue`, built from the shared pieces.
  4. Add `netlify/forms/<slug>.ts` (`loadDetails`, `saveAnswer`), plus `mineOf` and `missing` in `rules.ts`.
  5. Wire all three registries: `src/forms/rules.ts`, `src/forms/index.ts` and `netlify/forms/index.ts`.
  6. Extend `FormSlug` and `FormDetails`.
  7. Remember that only one open form may have availability.
- **P7:** locking in and closing.
- **P8:** editing practices.

Follow `authoring-agentic-docs`.

**Review per phase:** `/security-review` for P1, P3 and P3b, and `/code-review` for P4a–P8. Then `yarn type-check`, `yarn lint` and `yarn build`, and format only the files you touched.

## Test Scenarios

There's no test runner, so each scenario is checked by hand. The server phases check the session-free paths with `curl` and the local database. Signed-in scenarios run after P2, in the browser under `yarn netlify`.

### User-facing
- Given someone signed out, then every `/api/band/*` call returns `401` without touching the database.
- Given a signed-in Google account with no slug role, or with two, then it gets `403 not-a-member` and "This account isn't on the band list."
- Given Nick, when he answers for Francesco, locks in, closes a form, edits a practice, or answers a past date or one two years out, then it's refused. Given Colin, the date limits don't apply.
- Given the P3b deploy, then "March show planning" exists, and each member has one to-do showing "Dates 0 of 90" (or the pre-filled count) and "Songs: Not answered".
- Given a member who marked Aug 7–15 No before, when a form covering August opens, then those days show No and the pre-fill note counts them.
- Given a member who answered every remaining date and the songs, then the to-do reads "just sign off", and one tap clears it.
- Given a blank day tapped three times, then it shows Yes, No, Not sure, and never blank.
- Given every Tuesday blank, when "Fill a weekday at once…" → Tue → No, then every remaining Tuesday is No.
- Given Yes with only Song filled, then nothing saves and Sign off reports the songs missing. When Band is filled, it saves.
- Given Yes with two songs, then both appear in the responses under their name. Given No, the songs count as answered.
- Given the due date has passed, then the to-do is pink ("Overdue by N days. Shame."), and answering and signing off still work.
- Given March show planning is open, then another form without availability can be open at the same time, and members see one to-do per open form. A second open form with availability is rejected by `forms_one_open_availability`.
- Given all five signed off March show planning, then everyone sees "Everyone's in", and Colin's Pick practice dates opens `/da-band/admin/forms/{id}`.
- Given Colin locks in three dates, then the form is closed, three practices exist (Time TBD, Burtonsville), the days are pink, and Possible dates sits below the calendar.
- Given Colin, then the header shows Admin, and the dashboard lists open forms first, then Past forms, with no "+ New form". Given Nick, there's no Admin link, and every `/da-band/admin…` path shows "Access denied".
- Given Colin opens a form's page, then Responses shows each member's sign-off and "n of N dates", followed by the song list.
- Given Colin sets Dec 6 to 7:00–10:00 PM, Scheduled, with one song, then home's Next practice shows that time and song, with no Tentative badge.
- Given a practice save on a day that already has a live practice, then "Another practice is already on {date}."
- Given a day one member marked No, then it's black, with their dot pink. Given five yeses and nothing booked, then it's yellow and listed.
- Given someone paging the calendar, then it stops at December of next year.

### Edge cases
- Two lock-ins racing for a day: one gets `409 already-booked`, and the whole lock-in rolls back.
- A song pitch with an empty artist, or 21 songs: `400`. A `PUT …/answers` on a closed form: `409 closed`.
- A form row whose slug the client doesn't know shows "This form needs an app update."
- Save queues: a tap during an in-flight save survives, a stale load doesn't undo a save, a `403` drops only that batch, and offline changes retry until they save.
- The practice import re-run updates in place, and marking a day cancelled updates the same row.

## Manual Verification

These are Colin's steps:

1. Enable Identity (invite-only, Google).
2. Invite the five members.
3. In the Identity dashboard, give each user **exactly one** slug role (`anna`, `kyle`, `nick`, `francesco` or `colin`), and give Colin `admin` as well. The dashboard sets roles only, and that's all `getCurrentMember` reads.
4. **Before P4a deletes `practices.ts`,** copy its entries into `band-data/import.ts`.
5. Give the build session March show planning's due date (for migration `0003`).
6. **On release:** deploy (migrations `0001`–`0003` run, and the form row appears), then run `yarn seed:band` against production (a dry run, then `--write`), then check `/da-band`. Previews are copied from production, so they're empty until then.

## Later: phase 2, sign-in and gate (paragraph)

- `/da-band/login` (`da-band-login`, query `redirect`) shows "Sign in with Google", through `src/utils/auth.ts`, the only client importer of `@netlify/identity`.
- A `beforeEach` guard on `meta.requiresMember` calls `loadMe()` in `src/stores/band.ts`. A `401` goes to login, and a `403` shows "This account isn't on the band list."
- `main.ts` lazy-loads `auth.ts` only on callback hashes.
- The header shows "Signed in as {name} · Sign out", and sign-out clears `band.me`.
- Still to verify: where the OAuth return lands, and the `nf_jwt` cookie.

## Appendix: draft `## Project profile` for `CLAUDE.md`

Paste this into `CLAUDE.md`. This planning session wasn't cleared to edit that file.

```md
## Project profile

- **Commands:** type-check `yarn type-check`; lint `yarn lint`; format `yarn format` (with another session's uncommitted work here, `yarn prettier --write <files>` on your own files only); build `yarn build`; dev `yarn netlify`; seed `yarn seed:band`. No test runner and no e2e.
- **Plans:** `planning/` (flat, `YYYY-MM-<topic>-plan.md`); backlog in `planning/da-band-backlog.md`.
- **Specialist agents:** none; the building session does the work itself.
- **Reviewers:** `plan-reviewer` (plans), `/code-review` and `/security-review` (code; security for anything under `netlify/` or touching auth).
- **Rules to read first:** this file's Cross-file invariants; `.claude/skills/` for shows, posters, images and band data (including "add a new band form").
- **Extra Risk Flags:** anything that makes band-internal data reachable without `getCurrentMember`; anything that puts emails or schedules in the repo (it's public).
- **Deploy:** Netlify builds `main` on push; deploy previews per PR, each with a database branch copied from production. Functions in `netlify/functions/`; migrations in `netlify/database/migrations/` (forward-only, applied on deploy, applied locally by hand).
```
