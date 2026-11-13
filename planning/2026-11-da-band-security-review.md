# /da-band security review (2026-11-12)

Scope: `feature/da-band` vs `main` plus the uncommitted restyle. Read-only review, inline (no subagents). `yarn build-only` was run to check `dist/`. Nothing was run against a database or Netlify.

**Result: 0 High, 0 Medium, 4 Low, 3 Info.** No exploitable authentication, authorization, injection or data-leak path found.

## What was verified (Confirmed clean)

- **Every function authenticates before it touches data.** `band-me`, `band-availability`, `band-forms` and `band-practices` all call `authenticate` (→ `getCurrentMember` / `requireAdmin`) before any `band-db` call. Admin-only paths use `authenticate(req, true)`: practices POST and PUT, forms `lock-in` and `close`. GET list endpoints require a member.
- **No cross-member access by id, slug or body.**
  - Availability PATCH: `target` must be a roster id, and `target !== current.member && !isAdmin` returns 403. Members are bounded by `memberLimits` (today → Dec 31 next year, can't clear). Only the admin can set `source`.
  - Form answers and sign-off use `current.member` from the token, never a body field. `idFrom` accepts only `^[1-9]\d{0,9}$`. The `ACTIONS` lookup uses `hasOwnProperty`, so no prototype-key tricks.
- **SQL is fully parameterized.** The only interpolations in `netlify/lib/band-db.ts` are constants: `FORM_COLUMNS`, `DAY`, `TIME`, the `guard` strings, and `${table}`/`${column}` from a hard-coded tuple list. User values only appear in `$n` parameters or `unnest($n::type[])`. Dates are validated by `isIsoDate` (round-trip) before they reach SQL.
- **Migrations have sensible constraints.** Member FKs, answer and status `check`s, a one-live-practice-per-day unique index, one open availability form, and `wants_new = (suggestion is not null)`. The song text has a DB length check.
- **Dev bypass is not in the client bundle.** `grep -rl "x-dev-member|da-band-dev-member|dev-auth" dist/` returned nothing. It is gated by `import.meta.env.DEV`.
- **No `v-html` added.** The only use is `show-card.vue:22` on `gig.text`, which is static authored data. All band views use `{{ }}` interpolation.
- **No emails, secrets or connection strings in `git log -p main..HEAD`.** The only hits were prose in planning docs. `members.ts` has no emails. `/band-data` is ignored (`git check-ignore` confirms) and no `band-data/` file is tracked. The untracked files (`deno.lock`, the pnpm files, the placeholder jpeg, three new `.vue` files) carry nothing sensitive.
- **CSRF on writes.** `checkWrite` requires `Origin === new URL(req.url).origin` and a JSON content type, and a missing Origin is rejected. A cross-site form POST can't set JSON content type without a preflight, and the function returns no CORS headers. GET endpoints are read-only. Responses are `private, no-store`.
- **Login redirect is not an open redirect.** It goes through vue-router `push`/`replace` (same-origin only). `completeAuthCallback` additionally requires the `/da-band` prefix.
- **Identity roles.** Exactly one member-slug role, otherwise `not-a-member` (403). `admin` is read only from the roles array. Roles come from the verified token via `getUser()`, not from client input.

## Findings

### 1. LOW: The dev bypass ships in the deployed function bundle, behind env gates only (Plausible)

`netlify/lib/current-member.ts:20-39` (`isNetlifyDev`, `devMemberFrom`), called first in `getCurrentMember` at line 44.

- **Scenario:** The code is deployed. It is inert only if `NETLIFY_DEV=true`, `NETLIFY_LOCAL=true` and `CONTEXT=dev` all hold, plus a localhost host. If someone later adds `NETLIFY_DEV` or `CONTEXT` as a Netlify UI env var (a plausible "make previews behave like dev" mistake), any request with `x-dev-member: colin` and `Host: localhost` becomes admin. Spoofing the Host is hard through Netlify's edge, but this is a full auth bypass, so one config slip is expensive. The three variables are trusted input; the risk is mistake, not attacker.
- **Fix:** Keep the gates and also require `!process.env.DEPLOY_ID` and `!process.env.NETLIFY` (verify first that `netlify dev` doesn't set them). Better, move the bypass to a separate module loaded by dynamic `import()` only when the gate passes, or have the bundler drop it for production builds. Add a note in the band-data runbook: never set those three variables in the Netlify UI.

### 2. LOW: Removed members keep access for up to an hour (Confirmed, documented)

`netlify/lib/current-member.ts:41-44` comment; role is read from the token.

- **Scenario:** Removing a member's role in Identity doesn't revoke their current token until it refreshes. During that window they can still read the band calendar, practices and forms, and write their own answers.
- **Fix:** Accept it for a five-person band, or if removing someone matters, also revoke their sessions or delete the user in Identity. Write that into the runbook.

### 3. LOW: No framing or CSP headers on `/da-band` (Plausible)

`public/_headers` sets only `X-Robots-Tag`.

- **Scenario:** An attacker page frames `/da-band/admin/...` and overlays decoys so the admin clicks "Lock in" or "Close form". The session cookie is `SameSite`-dependent, and the Origin check doesn't help because the clicks come from the genuine origin. Needs a targeted lure of Colin while signed in, and the damage is closing a form or creating practices.
- **Fix:** Add `X-Frame-Options: DENY` and `Content-Security-Policy: frame-ancestors 'none'` for `/da-band/*`, and ideally `X-Content-Type-Options: nosniff` and a `Referrer-Policy`.

### 4. LOW: Band names, nicknames and the first form's schedule are public in the repo (Confirmed, by design)

`src/components/band/members.ts`, `netlify/database/migrations/0003_form_early_2027_planning.sql:14` (due 2026-12-06, window Jan 1 to Apr 30, 2027), `src/utils/practices.ts:31` (`PRACTICE_HOME = 'Burtonsville'`).

- **Scenario:** Anyone reading the public repo sees first names and nicknames, the planning window, and the usual practice town. It is low sensitivity, but the brief says schedules shouldn't land in the repo. No emails, concrete practice times or addresses are present.
- **Fix:** Decide whether the town default and the planning window are fine to publish. If not, move them to `band-data/` and the seed script. Migrations applied by a deploy can't be edited later, so decide before the first deploy.

### 5. INFO: Origin check is hand-rolled, not `verifyRequestOrigin`

`netlify/lib/http.ts:16-19`. It is equivalent in effect for these endpoints. The one risk is functional, not security: if Netlify ever presents a `req.url` origin that differs from the browser's Origin (custom domain aliasing), writes would 403 `bad-origin`. Test on a deploy preview. Consider swapping to the library helper so it tracks upstream.

### 6. INFO: DB column lengths for practice text are enforced only in app code

`netlify/database/migrations/0002_band_forms_practices.sql`: `practices.location`, `practice_songs.title` and `practice_recap_lines.line` have no length checks. Only `parsePracticeInput` limits them (80, 120 and 300 characters). Every writer goes through `band-db`, and the seed script runs the same parser, so there is no current gap. Add checks if another writer ever appears.

### 7. INFO: Identity signup mode is configuration, not code

With Google OAuth, anyone with a Google account can create an Identity user unless signup is restricted. In the code, the real defense is the role gate (`not-a-member` → 403 on every endpoint), and the roles are admin-assigned. The invite-only and external-provider settings must be confirmed in the Netlify UI before release.

## What I didn't check

- Netlify Identity and site settings (invite-only, Google provider scopes, cookie flags and `SameSite`, token lifetime). Nothing in the Netlify UI was inspected.
- The `@netlify/identity` v2 `getUser()` internals (signature verification, where it reads the token from). I relied on its documented behavior.
- How Netlify presents `req.url` and `Host` to functions in deploys, and whether `NETLIFY_DEV` and the other variables are really absent there.
- Deploy-preview and branch-deploy behavior (separate DB branches, whether the preview URL accepts the production Identity cookie).
- A live run: no endpoints were exercised, no dev server touched, and no database queried (including the local one).
- The full text of the 500 KB diff: I read all server, shared-rule, router and auth files, but the large restyle (Vue templates and SCSS) only by grep for `v-html` / `innerHTML` and dev-only imports.
- Dependency advisories, the Yarn to pnpm migration files and `deno.lock`.
- Client store and component logic beyond the router guard, `auth.ts`, `band-api.ts` and `dev-auth.ts` (client-side checks are not a security boundary here).
