# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vue 3 + Vite + TypeScript static marketing site for the band Lies From Granny, deployed to Netlify at liesfromgranny.com. All content (shows, songs) is static TypeScript data in the repo — there is no CMS, API, or backend.

## Commands

Package manager is Yarn 3 (Berry, pinned via `.yarnrc.yml` → `.yarn/releases/`, `node-modules` linker). Use `yarn`, never `npm`.

- `yarn` — install
- `yarn netlify` — **use this for local dev, not `yarn dev`.** Rendered image URLs point at `/.netlify/images`, which only `netlify dev` can serve. Under plain `vite dev` every image on the site 404s.
  - **One dev server, Colin's.** Colin keeps `yarn netlify` running on :8888. Sessions never start, stop or restart a dev server: `.claude/launch.json`'s `netlify-dev` only attaches to :8888, and Vite HMR plus netlify dev's function reload pick up edits. Each extra `netlify dev` grabs new ports and opens new tabs. If :8888 isn't up, say so instead of starting one.
- `yarn dev` — plain Vite dev server (broken images; only useful for non-image work)
- `yarn type-check` — `vue-tsc --noEmit`
- `yarn lint` — ESLint with `--fix`
- `yarn format` — Prettier over `src/`
- `yarn build` — runs `type-check` and `build-only` in parallel (`npm-run-all`)
- `yarn preview` — serve the production build

- `yarn test` — Vitest (`vitest run`, jsdom). Specs sit next to the code as `*.spec.ts`; shared factories (`makeForm`, `makeMyDays`, `makeBandAvailability`) and the PrimeVue `mountWithPrime` helper are in `src/test-utils/`. `yarn test:watch` for watch mode.
- `yarn test:e2e` — Playwright smoke specs in `e2e/` (Chromium only), read-only against Colin's dev server on :8888. Needs `yarn netlify` already running; there is no `webServer` block and sessions never start it. Not part of `yarn test`.

**Verification gate after a change:** `yarn type-check`, `yarn lint` and `yarn test`, plus `yarn build` for anything touching config or build output. Run `yarn test:e2e` when :8888 is up and the change touches `/da-band` flows. Pins to know: `@vue/test-utils` is held at 2.4.6 (2.4.7+ needs Vue 3.5; the repo is on 3.3) and Vitest at 0.34 (Vitest 1+ needs Vite 5).

## Architecture

**Bootstrap.** `src/main.ts` creates the app and registers Pinia, the router, and PrimeVue, then imports the global SCSS entry. Theme CSS, PrimeVue base CSS, PrimeIcons, and PrimeFlex are imported here as side effects — component-level styles do not import them.

**Routing.** `src/router/index.ts` defines all routes with lazy `import()` components, so each view is its own chunk. Both `/` and `/home` render `home.vue`. A catch-all renders `_404.vue`, and `public/_redirects` (`/* /index.html 200`) makes Netlify serve `index.html` for every path so client routing works on refresh. `router.beforeResolve` scrolls to top on every navigation.

**Layout.** Views don't render the nav or footer themselves — each wraps its content in `<Layout>` (`src/router/layouts/main.vue`), which supplies `nav.vue`, a `<slot />`, and `footer.vue`.

**Content model.** Shows and songs are plain exported arrays:
- `src/components/shows/shows.ts` → `Gig[]` (`src/models/gig.ts`)
- `src/components/songs/songs.ts` → `BandListing[]` (`src/models/song.ts`)

Views compute over these arrays directly. Pinia is registered but effectively unused — `src/stores/counter.ts` is the untouched Vue scaffold store. Don't add a store for content that belongs in these static modules.

**Images.** Source files live in `public/images/` and are referenced by root-relative path in the static data. Every *rendered* URL goes through `netlifyImage(src, width, format)` in `src/utils/images.ts`, which builds a Netlify Image CDN URL. The transform happens at render time only — never store a CDN URL in `shows.ts`/`songs.ts`. Widths are chosen from the rendered slot size, not the source size.

**Styling.** **PrimeFlex 3 utility classes in the template are the default** (Colin, 2026-11-12; `~/.claude/rules/styling.md`): spacing, layout, flex, grid, sizing and type go inline (`flex align-items-center gap-2 mb-3`, `col-12 md:col-6`). PrimeFlex 3's names differ from Tailwind/UnoCSS (`align-items-center`, `justify-content-between`, `font-bold`), so check its docs. No new BEM classes or partials for what utilities can express. SCSS remains only for brand tokens and gradients (`src/styles/_variables.scss`), PrimeVue theme overrides, and keyframes. When you change a component's styling, move its existing BEM styles to utilities in the same change and delete the dead classes. **PrimeFlex's `bg-primary`/`text-primary`/`border-primary` are blue here** (`_primeflex-variables.scss` resets `--primary-color` after the theme sets pink); use `bg-lfg-pink`, `text-lfg-pink`, `border-lfg-pink` or `bg-poster-yellow`, defined at the top of `src/styles/views/_da-band.scss`. The existing SCSS: `src/styles/index.scss` is the single entry and `@import`s every partial (root shared partials, `components/`, `views/`); a new stylesheet must be added to that list or it won't load. A move to UnoCSS (Colin's standard elsewhere) would be its own project.

## Cross-file invariants

These are the things that break silently if only one side is edited.

- **Path aliases are declared twice** — in `tsconfig.json` (`paths`) and `vite.config.ts` (`resolve.alias`). Changing one without the other type-checks but fails at build, or vice versa. Aliases: `@`, `@components`, `@models`, `@router`, `@styles`, `@utils`, `@views`.
- **The home hero preload is hand-duplicated.** `index.html` has an inline script that injects `<link rel="preload">` tags for the LCP hero, gated on the pathname so it only fires on home routes. Those URLs must match the `netlifyImage` srcset in `src/router/views/home.vue` character for character — a mismatch causes a second download instead of a faster LCP. Update both in the same change. The script must also stay first in `<head>`, ahead of the preload scanner.
- **Show dates are parsed strings.** `src/utils/shows.ts` (used by `shows.vue` and `/da-band`) splits upcoming from past with `new Date(\`${show.date} 23:59:59\`)`. `Gig.date` must stay a human-readable string `new Date()` can parse (`'March 16, 2026'`, `'Sept 27, 2025'`). An unparseable date makes the show vanish from both lists.
- **The data files are annotated, not cast** — `export const shows: Gig[]`, `export const songs: BandListing[]`. Keep it that way: an `as Gig[]` assertion at the end of the array silently suppresses missing-field errors on every entry, whereas the annotation makes `yarn type-check` validate each new show or band listing. `Gig.songs` is optional (only shows debuting new material carry it); everything else on `Gig` and all of `BandListing` is required.
- **`show-card.vue` renders `gig.text` entries with `v-html`.** Only intentionally authored, trusted HTML belongs in `Gig.text`.
- **`songs-container.vue` sorts nested `songs` arrays in place**, mutating the imported `songs` module data. Anything else reading that module sees the sorted result.
- **The contact form is a Netlify form.** `index.html` carries a hidden static `<form name="contact" netlify netlify-honeypot="bot-field">` for Netlify's build-time detection, because the real form in `src/router/views/contact.vue` is client-rendered and invisible to the crawler. The rendered form's `name` and its hidden `form-name` value must match that stub. Verify deploy behavior before changing either.

## Conventions

- Vue SFCs use `<script setup lang="ts">`, kebab-case filenames, PascalCase in templates.
- Components are grouped by feature under `src/components/` (`home`, `layout`, `shows`, `songs`); route-level composition lives in `src/router/views/`.
- Shared social links belong in `src/utils/urls.ts`.
- Prettier config is authoritative and unusual: tabs, single quotes, no trailing commas, `printWidth` 120, `vueIndentScriptAndStyle: true`, and `endOfLine: "crlf"`. Run `yarn format` rather than hand-matching.
- ESLint extends `vue3-essential` + TS + Prettier; `vue/multi-word-component-names` is off, which is why `nav.vue`, `footer.vue`, `shows.vue` are legal names.

## Repo skills

`.github/skills/` holds task-specific guidance worth reading before the matching work:

- `show-blurb-writing` — adding a `Gig` entry to `shows.ts`, including band voice and required fields
- `show-poster-placeholders` — generating the minimal ring-poster placeholder PNG for an upcoming show with no real flyer (SVG + `sharp`; `<textPath>` does not render, arc text must be placed per character)
- `site-images` — the full image rules: asset paths, CDN widths per slot, preload mechanics, alt text and dimensions

`AGENTS.md` is a shorter sibling of this file covering the same ground; keep the two consistent if you change project conventions. `planning/` holds a UI/UX review and priority board — background on what's intentionally unfinished (contact-form wiring, page `h1`s, song search), not a task list to act on unprompted.
