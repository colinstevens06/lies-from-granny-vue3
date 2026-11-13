# Yarn 3 to pnpm migration plan

Written 2026-11-12. Status: scoped and trial-run, not started. Goal: switch the package manager from Yarn 3 (Berry) to pnpm, ideally before the da-band rollout lands more dependencies.

## What was verified

**Trial in a scratch copy (pnpm 12.18.0, Node 24.13.0), done 2026-11-12.** The copy skipped `.git`, `public/images` and `planning`; `.yarn` and `.yarnrc.yml` were removed.

- `pnpm import` converted `yarn.lock` into `pnpm-lock.yaml` and kept resolved versions.
- `pnpm install --frozen-lockfile` **fails the first time** with `ERR_PNPM_IGNORED_BUILDS`: esbuild (x3), netlify-cli, sharp, unix-dgram, vue-demi. pnpm blocks dependency install scripts by default.
- `pnpm approve-builds --all` wrote `pnpm-workspace.yaml` with an `allowBuilds:` list of those five packages. After that, install is clean.
- `vue-tsc --noEmit` had no errors, ESLint on `src` printed nothing, and `vite build` succeeded.
- No phantom-dependency (undeclared import) failures appeared. The `@rushstack/eslint-patch` setup works under pnpm's strict layout.

**Netlify docs (docs.netlify.com, read by a Haiku subagent):**

- Netlify detects pnpm from `pnpm-lock.yaml` and runs `pnpm install`. Yarn is chosen if `yarn.lock` exists or `packageManager` names yarn.
- Netlify honors `"packageManager": "pnpm@x.y.z"` through Corepack. It needs an exact version, not a range. Default pnpm on the build image is 10.x.
- Build image is Ubuntu 24.04 with Node 24 by default. `.nvmrc`, `.node-version` or `NODE_VERSION` override the UI setting.
- `CI=true` on Netlify builds. `PNPM_FLAGS` is passed to `pnpm install`.
- **Not documented:** precedence when both lockfiles exist (so delete `yarn.lock` in the same commit), and any pnpm build-script behavior. The ignored-builds risk below is therefore my inference from the local trial, not from Netlify.

## Still unknown (Colin to check, Netlify UI)

The Netlify connector exposes no build settings, and there is no `netlify.toml`. Open https://app.netlify.com/projects/animated-moxie-fc7d09 → Project configuration → Build & deploy → Continuous deployment → Build settings and record:

1. The **build command**. If it says `yarn build`, change it to `pnpm build` in the same step as the merge (see the order below).
2. Any `NODE_VERSION`, `NETLIFY_USE_YARN` or `YARN_VERSION` environment variables. Delete `NETLIFY_USE_YARN` and `YARN_VERSION` if present, since `NETLIFY_USE_YARN=true` would force Yarn.
3. The publish directory (expected `dist`). It should not change.

## Decision: which pnpm version

Pin `pnpm@12.18.0`, the version trialed. The `allowBuilds` key in `pnpm-workspace.yaml` is what pnpm 12 wrote. pnpm 10 (Netlify's default) uses `pnpm.onlyBuiltDependencies` in `package.json` instead, so do not let Netlify fall back to its own pnpm. The `packageManager` pin prevents that. The pin is only confirmed on Netlify once the deploy preview builds.

## Steps

Do these on a separate branch off `main`, after the da-band work lands. Open a PR; don't merge without Colin's go-ahead.

1. **Branch** `chore/pnpm` from `main` after `feature/da-band` merges.
2. **Package files**
   - Add `"packageManager": "pnpm@12.18.0"` to `package.json`.
   - Delete `.yarnrc.yml`, `yarn.lock` and the tracked `.yarn/` directory (two files: `releases/yarn-3.3.1.cjs` and `plugins/@yarnpkg/plugin-interactive-tools.cjs`).
   - `corepack pnpm import`, then add `pnpm-workspace.yaml` with the `allowBuilds` list (re-run `pnpm approve-builds` to regenerate it against whatever dependencies exist by then), then `pnpm install`. Commit `pnpm-lock.yaml` and `pnpm-workspace.yaml`.
   - Remove the `# Yarn` block from `.gitignore`.
3. **Command references**, swapping `yarn` for `pnpm`:
   - `CLAUDE.md`: the "Yarn 3 (Berry...)" line and the commands list. Say "never `npm` or `yarn`".
   - `AGENTS.md`: the commands list and the `yarn netlify` note. Keep it consistent with `CLAUDE.md`.
   - `README.md`: "uses yarn" line and the command list.
   - `.claude/launch.json`: `"runtimeExecutable": "yarn"` becomes `pnpm`.
   - `.github/skills/site-images/SKILL.md` and `.github/skills/show-blurb-writing/SKILL.md`: one `yarn type-check` line each.
   - `planning/2026-da-band-edition.md` and `planning/2026-11-da-band-auth-plan.md`: about 20 `yarn` mentions, including `yarn netlify link`, `yarn seed:band`, and `yarn prettier --write`. The last becomes `pnpm exec prettier --write`.
   - Re-run `grep -rIn yarn . --exclude-dir=node_modules --exclude-dir=.git` at the end. It should return nothing but this file and history.
4. **Verify locally**: `pnpm install --frozen-lockfile`, `pnpm type-check`, `pnpm lint`, `pnpm build`, and `pnpm netlify` (open the site, check that images load). `pnpm lint` runs `--fix`, so check `git status` afterward for unintended edits.
5. **Netlify**
   1. Open the PR. Netlify's deploy preview builds it with the new lockfile.
   2. If the build command in the UI is `yarn build`, the preview fails before it can pass, so change the UI command to `pnpm build` first. This briefly breaks any other branch's deploys that still carry `yarn.lock`, so do it just before opening the PR and keep the window short.
   3. Check the preview's build log for "pnpm", the correct version, no "ignored build scripts" error, and a working site, including the contact form and anything under `netlify/`.
6. **Merge** (Colin's go-ahead), then watch the production deploy.

## Risks and rollback

- **Other branches and sessions.** Anything still based on a `yarn.lock` branch will fail to build on Netlify once the UI build command changes. Rebase or merge `main` into those branches. No other session should be editing `package.json` during the switch.
- **Dependency drift from `pnpm import`** is low (it preserves resolved versions), but run a final `pnpm build` and compare `dist` sizes against `main`.
- **Rollback:** revert the PR (the Yarn files return) and set the Netlify build command back to `yarn build`. Nothing external changes besides the build command and the lockfile.

## Effort

About an hour end to end, mostly the doc swaps and watching the preview deploy. The trial found one fix (`allowBuilds`), and nothing else needed changing.

## Notes

- `planning/` is **not** git-ignored. Two files in it are tracked (`2026-09-first-pass-updates.md`, `2027-jan-feb-availability-poll.md`), and the rest are untracked. Whether to ignore it is Colin's call.
- The scratch copy showed `netlify/`, `scripts/` and `band-data/` directories that were not in the repo root when the first scope was done. That's the da-band work landing in the checkout, which is why the switch should wait.
