# Feature: /da-band frontend layering, aligned with Speed Shopper

**Status:** Phase 1 built
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

## Phase 2 — split the store (scope only)

Replace `useBandStore` with `useMemberStore` (`me`, `loadMe`, `signOut`; the session singleton), `usePracticeStore`
(`practices`, `savePractice`), `useAvailabilityStore` (`availability`, `myDays`, `setMyAnswers`, the answer queue) and
`useFormStore` (`forms`, `openForms`, `availabilityForm`, sign-off, close, the form-answer queue). Each store loads
its own data with its own `loadState`, save version and `saveProblem`; `useBandPage` loads all three in parallel and
combines their states. Cross-store pieces become composable functions: `myTodos` (member + forms) and lock-in (forms +
practices: books, then reloads both). Contracts are written when Phase 1 is built; the save-queue merge gets hardening
check 5. If it exceeds 15 source files, member and practice stores go first, availability and forms second.
