# `/da-band` backlog

Ideas that aren't in the MVP. The MVP is in `2026-11-da-band-availability-workflows.md`. Add new items at
the bottom with the date and where the idea came from. When an item ships or gets dropped, delete it
here; git keeps the history.

## Availability

- **Recurring schedules** (Colin, 2026-11-10). A member saves a pattern: "never Tue or Thu", or Anna's
  "every other Sunday, starting Jan 10". A new round then starts pre-filled from it. The MVP's weekday
  shortcut covers the simple case inside one round; this item makes the pattern persist across rounds.
- **Four out of five** (Colin, 2026-11-10). Highlight days where exactly one member is out in a different
  color. Context, not a rule to build: four of five usually means Anna (lead vocals) is out, and the
  drummer is always required. A rule could become "the drummer plus three others" if that holds up.
- **Notes on a day** (2026-11-10). "Yes, but only after 8". The MVP treats a day as all-or-nothing.
- **Several open rounds** (2026-11-10). The MVP allows one at a time.

## Forms

- **More part kinds** (Colin, 2026-11-10). Multiple choice ("Running back the jams, new jams, or a mix?")
  and short free text. The MVP has availability and yes/no with follow-up fields.

## Admin

- **Round history** (2026-11-10). See closed rounds and who answered when.

## Reaching people

- **Reminders** (2026-11-10). Automatic nudges before and after the due date, and a ping when a round
  opens. Blocked on edition doc §9 (notifications). Until then, the MVP's Copy text and Copy nudge buttons
  cover it.
- **Change feed** (2026-11-10). "Kyle changed Jan 14 to No." Useful once reminders exist.

## Testing

The first suite (Vitest unit and component tests, three read-only Playwright smoke specs) covers the release gate only. Write these next (2026-11-13):

- **Save lanes with fake timers.** Availability and form-answer queues: one in flight, retry keeps newer queued values, immediate flush for weekday fills, 401 handling in `band-api`.
- **Store load and reject paths.** `src/stores/band.ts`: initial load, a rejected save, `pendingFormAnswer` overlay, stale reload.
- **Pick-dates and lock-in.** `pick-dates.vue` and `possible-dates.vue`: picks dropped when they leave the groups (code review #2), lock-in request body, practices created per form.
- **Admin pages.** Form tile and status, practice editor validation (`practice-input.ts`), sign-off dots, the admin gate.
- **More component cases.** `week-grid.vue` and `answer-cell.vue` tap cycle, `form-todo-card.vue` copy and overdue states, `calendar-day.vue`.
- **Server functions against a local DB.** `netlify/` handlers (sign-off, availability writes, lock-in, `x-dev-member` only in dev) with a throwaway local database, never Colin's running one.
- **More E2E flows.** Sign off, tap an answer, weekday fill and the admin lock-in, against a disposable seeded database (the smoke specs are read-only on purpose).
- **Pin the PrimeVue version.** `yarn.lock` holds 3.32.2 but `^3.32.2` floats to 3.53.1 on a fresh install, where the weekday-sheet re-tap bug (review #3) appears. The re-tap test in `weekday-fill-sheet.spec.ts` guards it.
