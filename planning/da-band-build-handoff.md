# /da-band build: handoff (November 12, 2026)

The plan is `2026-11-da-band-auth-plan.md` (frozen). Operating notes are in `.github/skills/band-data/SKILL.md`. Project rules are in `CLAUDE.md` and `AGENTS.md`. This file only covers what those don't.

## Where things stand

All on `feature/da-band`, **nothing pushed, no PR**. Type-check and lint passed at each commit.

| Phase | Commit |
| --- | --- |
| P1 availability server | `b731a17` |
| P3 forms and practices server | `6b17c39` |
| P3b first form server | `9fbb0df` |
| P2 sign-in and gate (not a plan row; P4a needs it) | `548e1bf` |
| P4a store and save lanes | `862a9fd` |
| P4b admin gate, dashboard, band bar | `c61f579` |
| P4c admin form page, home admin cards | `e1d543b` |
| P5b registry, screen, to-dos, form page | `1a18c2e` |
| P6 calendar, possible dates, Edit mine | `ea25ec9` |
| P7 pick dates and lock in | `d074dc7` |
| P8 practice editor | `5858fe8` |
| Dev sign-in switch | `876550a` |
| To-do card restyle | `69ed4cc`, `0368238`, `b0cdcff` |
| Form retargeted to "Early 2027 planning" | `539955c` |

Another session built `band-calendar.ts` (`e4de980`) and P5a (`b560400`, `823f307`).

**Unverified or skipped:**
- Real Google sign-in has never run. Unknown: where Google's redirect lands, and whether `nf_jwt` reaches `/api/band/*`.
- Production seeding (`yarn seed:band --branch main`) has never run. Its credentials JSON shape and the branch name are assumptions.
- `/security-review` (server phases and the dev switch) and `/code-review` (client) have not run.
- Sign-off, lock-in and the practice editor were checked only on the server or with a faked store, not clicked through against the real API.
- `$bf-*` colors in `_band-forms.scss` should move to `_variables.scss` (plan U12).
- Planning docs and the prototype still say "March show".
- The plan's Project profile for `CLAUDE.md` is not applied.

## Traps

- **Netlify CLI:** `yarn exec netlify <cmd>`. `yarn netlify <cmd>` runs `netlify dev` and ignores the command.
- **Identity doesn't work locally.** `/.netlify/identity/*` falls through to the Vue app, and OAuth returns to production. Use the dev switch on the login page. The server accepts `x-dev-member` only inside `devMemberFrom` (`netlify/lib/current-member.ts`) when `NETLIFY_DEV`, `NETLIFY_LOCAL` and `CONTEXT` equal `true`, `true`, `dev` and the host is localhost. The client half is behind `import.meta.env.DEV`. After touching either, confirm `grep -r x-dev-member dist` is empty. Keep the bypass inside `getCurrentMember`.
- **Dev server:** Colin's `yarn netlify` on :8888 is attach-only. Don't start, stop or restart it. It holds the local database directory, so the CLI can't open the DB while it runs.
- **Local DB reset is pending.** The local row still has the old slug (`march-show-planning`), so the form is hidden. Colin: stop the server, run `yarn exec netlify database reset --force`, start the server, run `yarn exec netlify database migrations apply`, then `yarn seed:band --write`. Migration 0003 was edited in place, since no deploy has applied it.
- **A second dev server picks random ports.** Port 8889 or 57925 means a second server is running.
- **Netlify dev quirk:** a function's 4xx on a POST may fall through to static fallbacks, so `curl` can show 405 for a 403.
- **Shared checkout:** other sessions edit this tree. Stage files by explicit path, and check `git status` first. Never `git add -A` on the repo root, and never stash or switch branches. Colin's unrelated files are listed in the first task brief: `shows.ts`, `songs.ts`, `show-card.vue`, `gig.ts`, `site-images/SKILL.md`, `CLAUDE.md`, `deno.lock` and the Molloy's placeholder image.
- **Prettier writes CRLF** (the repo's setting). When editing with Python, match the file's line endings, or the diff shows the whole file.
- **Sass:** `a&:hover` is invalid, so write `&:hover`. Use `& &__x` to beat `.band-card ul`.
- **TypeScript is 4.7:** no `satisfies`.
- **PrimeVue 3:** use per-component imports, and `Sidebar` (not `Drawer`) for bottom sheets.
- **No path alias `@forms`:** use `@/forms/...`. Adding an alias needs `tsconfig.json` and `vite.config.ts` to change together.
- **Shared server code** (`src/utils/*`, `src/forms/*/{model,rules}.ts`, `src/models/*`) uses relative imports only, because Netlify's bundler doesn't read the aliases. `netlify/forms/index.ts` and `src/forms/rules.ts` must not import `.vue` files.
- **`FormSlug`** comes from `FormDetails['slug']`. A new form's slug breaks type-check until all three registries have it.

## Rough edges to fix next

- **Optimistic form answers:** the store doesn't apply them. Screens read `band.pendingFormAnswer`. Check that a fast reload can't show stale songs.
- **Save notice:** `band.saveNotice` is shown on the form page and Edit mine only, not on the home page.
- **Tile summary and asks:** the admin tile and "What this form asks" use ISO dates (`2027-01-01 to 2027-04-30`). Format them.
- **Overdue copy:** "Overdue by N days. Shame." was only seen with a forced class, never with real overdue data.
- **Login redirect:** after sign-out, the login page loses the previous `redirect`.
- **Rollback:** an unregistered slug is logged and hidden. If production ever rolls back below a form's migration, check that hiding works in practice.
