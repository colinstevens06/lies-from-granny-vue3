# Feature: /da-band frontend layering, aligned with Speed Shopper

**Status:** Phase 1 built (fc705fb); Phase 2 built
**Track:** Standard, two phases. Phase 1 raises no Risk Flag. Phase 2 raises **Concurrency or ordering** (the save
queues' load merge moves into split stores).

## Context

Speed Shopper's frontend layering (`speed-shopper/.claude/rules/frontend/layering.md`, `client-store.md`,
`composables.md`): Service → Store → Composable → Component, one store per entity, stores never import each other
except session singletons, cross-store joins and writes live in composables, stores hold no UI copy. `/da-band` has one
Pinia store (`src/stores/band.ts`) holding `me`, availability, forms and practices, plus notice copy and dead draft code,
and five views repeat the same loading paragraph. The goal is the same patterns here, adopted as this repo's rule.

**Not in scope:** leaving Pinia (no `Store<T>` base class), provide/inject, `*Dto` mappers (the wire shape is the app
shape today), any visible change. Every string the member sees stays character for character.

**Pattern reference:** `use-form-progress.ts` (a composable joining the store with the form rules into view-ready data).

**Decisions (Colin, 2026-11-16):** one store per entity (`useMemberStore` app-wide like Speed Shopper's `userStore`,
then availability, forms, practices); save queues stay in their entity store, recorded as a deliberate difference;
the rule is a project rule in this repo; add a `## Project profile` to `CLAUDE.md`; stay on Pinia.

**Assumptions:** phases are commits on `feature/da-band` (PR #21), not separate PRs. No specialist agents exist here,
so the build runs in one session; review uses `general-purpose` subagents (Sonnet) with the new rule as the brief.

## Grounding

| Symbol | Location | Verified |
| --- | --- | --- |
| `useBandStore`, `drafts`/`setDraft`/`clearDraft` (no callers outside the store) | `src/stores/band.ts:21,28,135-136` | ✅ |
| `saveNotice`, `NOTICE_RETRYING`, `NOTICE_RELOADED`, `reloadedNotice` | `src/stores/band.ts:14-15,29,127` | ✅ |
| `beforeunload` listener (checks `saving` and `drafts`) | `src/stores/band.ts:138` | ✅ |
| Loading paragraph, 5 copies | `views/da-band/{index,form,edit}.vue`, `admin/{form,practices}.vue` | ✅ |
| `onMounted(() => band.load())`, 7 views | the 5 above plus `history.vue`, `admin/index.vue` | ✅ |
| `possibleDates(...)` joined over availability + practices, 2 copies | `possible-dates.vue:51`, `views/da-band/index.vue:96` | ✅ |
| `calendarDayStatus`, `showNights`, `practicesStillNeeded`, `pickGroups` | `utils/da-band/band-calendar.ts`, called from `band-calendar.vue`, `possible-dates.vue`, `pick-dates.vue` | ✅ |
| `useBandPage`, `useBandCalendar`, `BandLoadState` | — | (new) |

## Implementation Freeze — Phase 1 (layers on the existing store)

1. **Rule `.claude/rules/frontend-layering.md` (new)**, `paths: ['src/**']`. Adapted from the three Speed Shopper
   files, not copied: the layer table (Holds / Imports / Does / Never) for Service, Store, Composable, Component; one
   Pinia store per entity, app-lifetime, and every page view loads what it shows on entry; the member store is the only
   session singleton any store may import; cross-store reads and writes are composable functions; a page view or a
   composable calls stores, and a component calls one only for a single-store read or write (presentational components
   touch none); stores hold no UI copy; store methods throw, change state only after success, and nobody re-handles a
   401. **Deliberate differences from Speed Shopper**, each with its reason: Pinia, not `Store<T>`; no provide/inject
   (Pinia stores are importable, so the pass-through composable is unnecessary); save queues live in their entity
   store (the load merge needs their pending state); no `*Dto` mappers until the wire and app shapes differ; one
   `loadState` per store instead of per-operation booleans. `CLAUDE.md` § Architecture gets a one-line pointer to it.
2. **`CLAUDE.md` gets `## Project profile`:** commands and verification gate (point at § Commands), plans in
   `planning/`, backlog `planning/da-band-backlog.md`, no specialist agents (build in-session), reviewers are
   `general-purpose` on Sonnet briefed with the touched rules, rules to read first (`frontend-layering.md`, the
   `band-data` skill).
3. **Store cleanup:** delete `drafts`, `setDraft`, `clearDraft`; the `beforeunload` listener checks `saving` only.
   Replace `saveNotice` with `saveProblem: 'retrying' | 'reloaded' | undefined`; the two notice strings move out.
4. **`src/composables/use-band-page.ts` (new):** `useBandPage()` calls `band.load()` in `onMounted` and returns
   `{ loadState, saveNotice }`, where `saveNotice` maps `saveProblem` to today's exact strings ("Not saved yet.
   Retrying…", "Couldn't save that. Your answers were reloaded."). The 7 views use it instead of their own
   `onMounted`.
5. **`src/components/da-band/band-load-state.vue` (new):** takes `loadState` and renders today's paragraph (same
   classes), "Couldn't load. Refresh to try again." for `error` and "Loading…" otherwise. **The view keeps the gate**,
   because the paragraph heads a `v-if`/`v-else-if`/`v-else` chain in `form.vue`, `edit.vue`, `admin/form.vue` and
   `admin/practices.vue`: `<BandLoadState v-if="loadState !== 'ready'" :load-state />` replaces the `<p>` in place, and
   `admin/index.vue` uses `v-if="loadState === 'error'"`.
6. **`src/composables/use-band-calendar.ts` (new):** `useBandCalendar()` owns the joins of availability, practices,
   `shows` and `today`: `dayStatus(date)`, `possibleDates(form)`, `showNights(form)`, `practicesStillNeeded(form)`,
   `pickGroups(form)`, each accepting `Form | undefined` where today's caller passes `band.availabilityForm`.
   `band-calendar.vue`, `possible-dates.vue`, `pick-dates.vue` and `views/da-band/index.vue` read through it and drop
   their own joins. Single-store reads (`band.availability` passed to rows, `form-responses.vue`) and the non-mount
   reloads (`form.vue:102`, `pick-dates.vue:110,114`) stay on the store, as the rule allows.
7. Execute this plan. Do not recreate or redesign this planning document during implementation.

## Agent Orchestration

| Role | Owns contracts | Files | Depends on |
| --- | --- | --- | --- |
| This session | 1–2 | `.claude/rules/frontend-layering.md` (new), `CLAUDE.md` | — |
| This session | 3–6 | `src/stores/band.ts`, `band.spec.ts`, `src/composables/use-band-page.ts` (new), `use-band-calendar.ts` (new), `src/components/da-band/band-load-state.vue` (new), the 7 `views/da-band/**` views, `band-calendar.vue`, `possible-dates.vue`, `pick-dates.vue` | 1 |

Rule first, so the code is written to it. One review pass at the end: a Sonnet `general-purpose` reviewer briefed with
the new rule, `~/.claude/rules/dry.md` and the diff.

## Test Scenarios

### User-facing

- Given the band data is still loading, When a member opens any `/da-band` page, Then it shows "Loading…".
- Given the load fails, When the page settles, Then it shows "Couldn't load. Refresh to try again."
- Given a save is failing, When the member is on Edit or a form, Then it shows "Not saved yet. Retrying…".

### Unit

- `use-band-page.spec.ts`: each `saveProblem` value maps to its string; `load` runs once on mount.
- `band.spec.ts`: the existing save and reload regressions pass against `saveProblem`.
- Existing `pick-dates.spec.ts` and `views/da-band/index.spec.ts` pass unchanged in behavior.

## Heal the Source

- `.claude/skills/band-data/SKILL.md:59` — "Every `/da-band*` view calls `band.load()` on mount" becomes "calls
  `useBandPage()`", in the Phase 1 commit.

## Phase 2 — one store per entity

**Track:** Standard, **Concurrency or ordering** flag (the save queues' load merge moves into split stores).
**Decision (Colin, 2026-11-16):** one commit for all of Phase 2, though it touches ~23 source files (over the 15 cap);
the contracts below are grouped 2a / 2b so review can still take them in two passes. **Assumption:** a refused save's
"reloaded" notice now clears on the next successful save **in the same store** (today any save in either queue clears
it), and a refusal reloads only its own store's data (today it reloads all three). Neither is a visible change in
normal use.

### Grounding (Phase 2)

| Symbol | Location | Verified |
| --- | --- | --- |
| `useBandStore` state, queues, `load` merge, getters, actions | `src/stores/band.ts:20-268` | ✅ |
| Shared `saveVersion` (bumped by both queues), `formsSavedDuringLoad` | `band.ts:29,66,95,82,97,146` | ✅ |
| `saving` read for sign-off | `views/da-band/form.vue:34,92` | ✅ |
| Non-mount reloads | `form.vue:102`, `pick-dates.vue:110,114` | ✅ |
| `loadMe` in the route guard | `src/router/index.ts:105` | ✅ |
| `useMemberStore`, `usePracticeStore`, `useAvailabilityStore`, `useFormStore`, `useBandData` | — | (new) |

### Implementation Freeze — Phase 2

**2a: session and practices**

8. **`src/stores/member.ts` (new), `useMemberStore`, id `'member'`:** `me`, `loadMe`, `signOut`, moved verbatim. The
   session store: it imports no other store, and `@utils/da-band/auth` and dev-auth stay behind dynamic imports
   (`nav.vue` loads it on every page). Callers: `router/index.ts`, `nav.vue`, `login.vue`, `admin-gate.vue`,
   `use-form-progress.ts`, `views/da-band/index.vue`, `form.vue`.
9. **`src/stores/practices.ts` (new), `usePracticeStore`, id `'practices'`:** `practices`, `loadState`, `load()`
   (`getPractices`), `savePractice`. Callers: `practice-editor.vue`, `history.vue`, `admin/practices.vue`,
   `admin/index.vue`, `admin/form.vue`, `views/da-band/index.vue`, `use-band-calendar.ts`.

**2b: availability, forms and their queues**

10. **`src/stores/availability.ts` (new), `useAvailabilityStore`, id `'availability'`:** `availability`, `loadState`,
    `load()` (`getAvailability`), `myDays`, `setMyAnswers`, the answer queue, `saving`, `saveProblem`. Imports
    `useMemberStore` for `me`. Its **own** `saveVersion`, bumped only by its queue; `load()` keeps my local row only
    when that version moved during the load, then lays pending answers back over it (today's rule, minus form saves,
    which never touch availability). A refusal drops the refused days (unless newer ones are queued), sets its refused
    flag and reloads **availability only**. Callers: `edit.vue` (`myDays`, `setMyAnswers`), `form-responses.vue`,
    `band-calendar.vue`, `use-form-progress.ts`, `use-band-calendar.ts`.
11. **`src/stores/forms.ts` (new), `useFormStore`, id `'forms'`:** `forms`, `loadState`, `load()` (`getForms`),
    `openForms`, `availabilityForm`, `myTodos` (reads the member store, which the rule allows), `signOffForm`,
    `closeForm`, `lockInForm` (the service call only), `setMyFormAnswer`, `pendingFormAnswer`, the form-answer queue
    with `formsSavedDuringLoad`, `saving`, `saveProblem`. `load()` keeps a form's local copy only while its answers
    are pending or saved since the load began (today's rule). A refusal sets its refused flag and reloads **forms
    only**. Callers: `views/da-band/index.vue`, `edit.vue` (`availabilityForm`), `form.vue` (`forms`, `signOffForm`),
    `admin/index.vue`, `admin/form.vue` (`forms`, `closeForm`), `use-band-data.ts` (`lockInForm`).
    **`src/forms/early-2027-planning/screen.vue` uses two stores, so it goes through `useFormProgress`**
    (`use-form-progress.ts`), which already joins member, availability and the form: it adds `pendingFormAnswer()`,
    `setMyAnswers` and `setMyFormAnswer(body)` (bound to its form) to what it returns, and screen.vue reads `myDays`
    from it. screen.vue imports no store.
12. **Each queue-owning store registers its own `beforeunload`** checking its own `saving`. `band.ts` and
    `band.spec.ts` are deleted; no file imports `@/stores/band`.
13. **`src/composables/use-band-data.ts` (new), `useBandData()`, no lifecycle hooks:**
    - `load()`: the three entity loads in parallel (`Promise.all`); never rejects (each store catches its own).
    - `loadState`: `'error'` if any store is `'error'`, else `'ready'` if all are `'ready'`, else `'loading'`.
    - `saving`: availability `saving` **or** forms `saving` (sign-off stays disabled while either queue is busy).
    - `saveNotice`: `'retrying'` if either store says so, else `'reloaded'` if either does, worded as today.
    - `lockIn(formId, days)`: `forms.lockInForm`, then `load()` of forms and practices; throws the `ApiError` as
      today. On a 409 `already-booked` the caller reloads with `load()`.
    `useBandPage()` becomes `useBandData()` plus `onMounted(load)`. `pick-dates.vue` uses `lockIn` and `load`;
    `form.vue`'s `incomplete` branch and `saving` use `useBandData()`.
14. **Docs in the same commit:** the rule's "Today" note is removed, and its component bullet says a feature component
    uses at most one entity store (plus the member store); one that needs two goes through a composable (form screens
    use `useFormProgress`); `band-data` skill line 58 (store and service
    description) names the four stores; `CLAUDE.md` § Content model's "Pinia is registered but effectively unused"
    line is corrected if it still says so.
15. Execute this plan. Do not recreate or redesign this planning document during implementation.

### Test Scenarios (Phase 2)

- Moved, behavior unchanged: code review #1 (refused answer dropped while taps are queued) to
  `stores/availability.spec.ts`; code review #5 (other forms take the server copy during a save) and sign-off to
  `stores/forms.spec.ts`; the refused-save `'reloaded'` test to `availability.spec.ts`.
- `availability.spec.ts`: a form save during an availability load does **not** keep my stale local row.
- `use-band-data.spec.ts`: `loadState` combines (one store erroring shows the error; all ready shows ready);
  `saving` is true while only the availability queue is busy; `lockIn` reloads forms and practices.
- `pick-dates.spec.ts`, `index.spec.ts`, `router/index.spec.ts`, `use-band-page.spec.ts`: spy on the new stores;
  behavior unchanged.
