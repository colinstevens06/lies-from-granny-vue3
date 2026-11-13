# /da-band client code review (2026-11-12)

Scope: `src/` on `feature/da-band` vs `main`, plus the uncommitted working tree. Read-only review, medium effort, done by reading the code against `CLAUDE.md` and the house rules. Server (`netlify/`) and auth/security are out of scope.

Gates run on the working tree: `yarn type-check` exit 0, `yarn exec eslint src --ext .ts,.vue` exit 0. `yarn build-only` was not run.

Summary: 0 High, 4 Medium, 8 Low. Nothing found that loses data silently in the normal path. The save lane and the merge rule in `load()` are sound for the common cases; the problems are at the edges.

"Confirmed" means I traced it in the code (or the installed library source). "Plausible" means the failure follows from the code but I did not reproduce it in a browser.

---

## Medium

### 1. A rejected availability save leaves the rejected answers on screen (Plausible)

`src/stores/band.ts:73-76` and `:155-158`, `src/composables/use-save-lane.ts:69-74`

On a 4xx the lane drops the batch and calls `onRejected`, which sets "Your answers were reloaded" and calls `load()`. But `setMyAnswers` already wrote the rejected values into `row.days` optimistically, and `load()` keeps my local row whenever `answerLane.busy.value` is true (`:156`). If the member kept tapping, another batch is queued, so `busy` is true and the reload keeps the whole local row, rejected values included. The notice claims a reload that didn't happen for those days.

Scenario: a tap crosses midnight Eastern or hits a closed range, the server answers 400 `date-out-of-range`; the member has tapped another day within 400 ms. The grid still shows the refused answer as saved, and sign-off can then fail with `incomplete` or pass against a state the server doesn't have.

Fix: in `onRejected`, delete the rejected `entries` from `row.days` (or remember the server's last-known value per key) before calling `load()`. Alternatively have `load()` discard local values for keys that are no longer pending.

### 2. Admin lock-in can send days that are no longer offered (Plausible)

`src/components/band/pick-dates.vue:~88-101` (`setPicked`, `lockIn`)

`picked` is local state; the two lists are computed from the store and `pickedIn()` filters what each SelectButton shows. If a day drops out of both lists after a refresh (a member flips to No, a practice gets booked, midnight passes), it disappears from the chips but stays in `picked`. The sticky bar still names it ("Lock in 3") and `lockIn` posts it.

Scenario: admin picks 4 days, sits on the page while Franny changes one to No; `band.load()` runs from the page's own mount/other events. The day vanishes from the chips; admin presses "Lock in 4" and a practice is created on a day that is now blocked. Whether the server refuses it is the other session's call; the client should not offer it.

Fix: `watch(groups, ...)` and drop picks not in `everyoneYesDays` or `oneShortDays`, or compute the sent list as `picked.filter(inEither)`.

### 3. Weekday sheet: re-tapping the selected answer does nothing (Confirmed)

`src/components/band/forms/weekday-fill-sheet.vue:23-32`

The SelectButton uses `:allow-empty="false"` and `:model-value="last[weekday]?.answer"`. In the installed PrimeVue 3.53.1 (`selectbutton/SelectButton.vue:85`), clicking the already-selected option returns without emitting when `allowEmpty` is false. After a fill, the tapped answer stays selected, so the same answer can't be tapped again.

Scenario: Tap Mon → Yes with overwrite off (blanks filled). Flip "Also change days I already answered" on, tap Yes again to apply it to every Monday: no event, nothing happens, and the row still says "N days filled ✓". The member must tap another answer first, which writes the wrong value.

Fix: stop driving the selected state from `last`. Pass `:model-value="undefined"` and use `allow-empty` (the default) or `unselectable`-style handling so every tap emits; show the last tap via the status text only.

### 4. A network or 5xx error in `loadMe` blanks navigation; a failed callback import never mounts the app (Plausible)

`src/router/index.ts:104-106`, `src/stores/band.ts:219-231`, `src/main.ts:20-31`

`loadMe` rethrows anything that isn't 401/403 (`band.ts:229`). The `beforeEach` guard doesn't catch it, so an offline or 500 response on `/api/band/me` rejects the navigation: vue-router logs an error, the first load shows an empty `<router-view>` and a click on a band link silently does nothing. Separately, `main.ts` chains `.then(() => { app.use(router); app.mount(...) })` with no `.catch`; if the lazy `./utils/auth` chunk fails to load on a callback hash, the whole site (public pages included) never mounts.

Fix: in the guard, catch and return `{ name: 'da-band-login', query: { reason: 'error' } }` (or a lightweight "can't reach the server" view); in `main.ts` add `.catch(() => undefined).then(mount)` so the site always mounts.

---

## Low

### 5. `load()` freezes the whole forms list when any save finished during the fetch (Plausible)

`src/stores/band.ts:160-164`

`mineChanged` is global, so when a save completes while a load is in flight, every form keeps its old copy, not just mine. Other members' sign-offs, `closedAt` and new forms (the `.some` guard lets only brand-new forms in) stay stale until the next load. Narrow window, but a form the admin just closed can still show as open and answerable.

Fix: keep the local copy only for the forms with a pending or just-saved body (`formLane.pendingValue(...) !== undefined`), and take the server's copy for the rest.

### 6. "Today" is read once and goes stale past midnight (Plausible)

`src/router/views/da-band.vue:85-86`, `da-band-edit.vue:~38`, `src/composables/use-form-progress.ts:14`, `src/components/band/pick-dates.vue:~74`

All capture `easternNow()` at setup. A tab left open overnight still treats yesterday as today: yesterday's cells stay tappable, "next practice" and "possible dates" keep yesterday, and the sign-off progress counts yesterday as required. The server refuses `date < today` (shared parser), so the tap hits rejection #1.

Fix: a small shared `useEasternToday()` composable (a ref refreshed on `visibilitychange` and a timer at the Eastern midnight) used by all four, which also removes four copies of the same two lines (`dry.md`).

### 7. Song question: required-text message, no way to clear a saved suggestion, local state never resyncs (Plausible)

`src/components/band/forms/yes-no-text.vue:15-17, 48-62`

- The prompt says "(optional)" but a red "Song is required when Yes is selected." shows. The sign-off isn't gated on it (`forms/rules.ts` is correct), so the message contradicts the rule.
- `publish()` returns early for a Yes with empty text, so clearing the box never saves. The server keeps the old suggestion while the screen shows an empty Yes, and leaving the page loses the edit with no notice.
- `wantsValue` and `textValue` are initialized once from props and never watched. After `onRejected` → `load()`, or any other refresh, the control keeps the stale local value.

Fix: reword the hint ("Type the song, or choose No"); on empty text under Yes, either emit `{ wants: false }` or show "Not saved until you type a song"; add a `watch` on `props.wants`/`props.text` that applies when there is no pending local edit.

### 8. Retry storm while failing: every tap or keystroke flushes at once (Plausible)

`src/composables/use-save-lane.ts:82-88`

`enqueue` calls `flush()` immediately whenever `failing` is true. While offline, each tap or keypress makes a request whenever nothing is in flight, and `schedule(RETRY_MS[failures++])` advances the backoff on every call, so the "2s, 4s, 8s" sequence is used up within a few taps and the lane drops to the 30 s fallback. The doc comment says "any change while failing retries at once", so this is intended, but it means the backoff is meaningless for an active user.

Fix: when failing, just update the queue and let the scheduled retry run; or reset `failures` only on success and don't increment on user-triggered flushes.

### 9. `onSaved` runs inside the `try`; the form lane applies only the last form's result (Plausible)

`src/composables/use-save-lane.ts:53-58`, `src/stores/band.ts:82-85`

If `onSaved` throws (a store bug), the catch sees `status` undefined → treated as a network failure, so a batch that already saved is re-queued and resent. Move `onSaved` after the `try/catch`. Also `formLane.send` loops forms and returns only the last `result.form`, so with two forms in one batch the first form's server copy is never applied. There's one form today; latent.

### 10. Weekday sheet status overstates what happened (Confirmed)

`src/components/band/forms/weekday-fill-sheet.vue:83-95`

With overwrite on, `filled` is the count of every open day for that weekday (`dayCounts`), but `fillWeekday` in `availability-section.vue:83-89` sends only the days whose answer differs. If all are already Yes, the sheet says "8 days filled ✓" and nothing was sent. Also `last` isn't cleared when the overwrite switch is flipped, so a stale "filled" line sits next to a different mode.

Fix: have `fillWeekday` return or emit the number actually changed and show that; clear `last` in a `watch(overwrite)`.

### 11. `showIsoDate` depends on how `Date` parses 'Sept' (Plausible)

`src/utils/shows.ts:18`, `src/components/shows/shows.ts` ("Sept 27, 2025")

`new Date('Sept 27, 2025')` is implementation-defined; V8 accepts it, other engines may return Invalid Date. Then `showIsoDate` gives `NaN-NaN-NaN`: the show never blocks a calendar day and `targetOf` compares strings against garbage. Only matters for a show whose date is used as a form target or booked day. Not tested in Safari/Firefox.

Fix: use "Sep" in the data, or parse with an explicit month map in `showIsoDate`.

### 12. Loading and error states reuse the page as if it were empty (Plausible)

`src/router/views/da-band.vue:7-9, 25-28, 53`

While `loadState` is `loading` (or `error`), the home page still renders "No practice on the calendar.", the next-gig block and an empty calendar under the "Loading…" or "Couldn't load" line. On error the message says to refresh but the cards below say there are no practices. Same pattern is fine on the form, edit and admin-form pages, which return early.

Fix: wrap the sections in `v-else` after the loading/error line.

---

## Checked and found fine

- Overwrite toggle: only today-onward in-range days are reachable (`availability-section.vue:64-73`), and only days whose answer differs are sent (`:85`). Off by default each time the sheet opens. Matches the plan. (Aside from #3 and #10.)
- Sign-off rule: `useFormProgress` calls the shared `ruleFor().mineOf` then `.missing` with `availabilityMissing`; the song question does not gate `done`.
- Dates: Eastern strings throughout, UTC-noon helpers for formatting, string compares for past/future. No DST problem found in `addDays`, `daysBetween`, `weeksInRange` or `monthsFrom`. `toIsoDate` (local) is only used by `showIsoDate`, where the parse and the format are both local.
- Save lane: keyed queue, one in flight, retry keeps newer queued values, 401 handled by `band-api`. `pendingFormAnswer` is used as an overlay (not a copy) in `screen.vue`, so it can't go stale.
- Router: lazy routes, `requiresMember` meta, `redirect` is only honored when it starts with `/da-band` in `auth.ts`.
- PrimeFlex class names in the changed `.vue` files (grep): no Tailwind-only names found. `w-2rem`, `w-4rem`, `white-space-nowrap`, `column-gap-3`, `row-gap-1`, `text-black-alpha-*`, `border-round-3xl`, `line-height-2` exist in PrimeFlex 3. Absolute/fixed positioning: none (sticky bars are in flow).
- Hand-rolled controls: only `answer-cell.vue` and `calendar-day.vue`, both with a lint-disable reason comment.

## Not checked

- No browser pass at all: nothing was rendered at 375px or any other width, and no clicks were made on :8888. The 375px comments above are from reading class lists and the grid definitions, not from looking.
- `yarn build-only` was not run.
- Not read: `practice-editor.vue`, `utils/practice-input.ts`, `da-band-admin*.vue` beyond the form page, `da-band-history.vue`, `day-answers-sheet.vue`, `form-responses.vue`, `form-status-card.vue`, `utils/form-status.ts`, `copy-button.vue`, the nav template, `shows.vue` changes.
- The SCSS (`_da-band.scss`, `_primevue-structure.scss`, `_nav.scss`) was not audited for leftover BEM spacing/layout; I only saw that `answer-cell--*`, `answer-dot--*` and `yes-no*` classes are still used by templates and presumably style colors. Whether those belong under "brand tokens" is not decided here.
- Whether the server refuses a lock-in day that is no longer valid (#2), and what it returns for an out-of-range save (#1), is the other session's area.
- `.github/skills` and `planning/` docs were not reviewed against the code.
