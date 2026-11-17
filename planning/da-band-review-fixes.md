# /da-band review fixes (2026-11-12)

The work list from the two reviews: [security](2026-11-da-band-security-review.md) (0 High, 0 Medium, 4 Low, 3 Info) and [client code](2026-11-da-band-code-review.md) (0 High, 4 Medium, 8 Low). Each item points at the full finding. Do these before the first deploy unless marked otherwise.

## Decided

- **Security #4, public schedule details: public is fine** (Colin, 2026-11-12). First names, the planning window, the due date and the default practice town stay in the repo. Emails and members' actual availability still never do.

## Fix before release

Done 2026-11-13 on `feature/da-band`; the hash is the commit.

- [x] (b8da458) **Code #3, confirmed:** in the weekday sheet, re-tapping the selected answer does nothing, so the overwrite switch can't re-apply the same answer. Stop driving the selection from `last`, and show the last tap in the status text only.
- [x] (38becb4) **Code #1:** a rejected availability save leaves the refused answers on screen. Drop the rejected entries from `row.days` before `load()`.
- [x] (9a92a1a) **Code #2:** admin lock-in can send days that are no longer offered. Send only `picked.filter(inEither)`, or prune `picked` on change.
- [x] (825ad2b) **Code #4:** a network or 5xx error from `loadMe` blanks navigation, and a failed auth chunk keeps the whole site from mounting. Catch the error in the guard, and always mount in `main.ts`.
- [x] (a3252d6) **Security #1:** harden the dev-bypass gate. Also require no `DEPLOY_ID` and no `NETLIFY`, after checking what `netlify dev` sets, or load the bypass with a dynamic import. Add a runbook note never to set those env vars in the Netlify UI.
- [x] (275e371) **Security #3:** add `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff` and a `Referrer-Policy` for `/da-band/*` in `public/_headers`.

## Batch of small fixes (one commit is fine)

- [x] (ecb7c85) Code #5–#12, with the runbook notes for security #2 and #5–#7: the forms list freezing during `load()`, "today" going stale past midnight, clearing a saved song suggestion, the retry storm while failing, `onSaved` ordering, the weekday status overstating what happened, `showIsoDate` parsing "Sept", and loading/error states that look like empty pages. Security #2 (an hour of access after a role is removed) and #5–#7 are runbook notes, not code.

## Not covered by either review

Browser checks at 375px and desktop, admin and practice pages after the utilities migration, real Google sign-in, and the production seed. Colin's click-through covers the first two; the release covers the rest.
