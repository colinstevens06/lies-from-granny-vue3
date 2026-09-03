# Agent Guidance

## Project

This is a Vue 3 + Vite static website for Lies From Granny. Use Yarn as the package manager; see [README.md](README.md) for setup and editor guidance.

## Commands

- Install dependencies: `yarn`
- Start development: `yarn dev`
- Type-check Vue and TypeScript: `yarn type-check`
- Build for production: `yarn build`
- Preview a production build: `yarn preview`
- Lint: `yarn lint` (ESLint runs with `--fix`)
- Format source: `yarn format`

There is currently no test script or test-runner configuration. Run `yarn type-check` and the relevant build or lint command after changes.

## Structure

- `src/main.ts` bootstraps Vue and registers Pinia, Vue Router, PrimeVue, PrimeFlex, PrimeIcons, and global SCSS.
- `src/router/index.ts` defines lazy-loaded routes; page composition belongs in `src/router/views/`.
- `src/router/layouts/main.vue` owns shared page framing with the navigation and footer components.
- Reusable components live in `src/components/`, grouped by feature (`home`, `shows`, `songs`, and `layout`).
- Show and song records are static data in [src/components/shows/shows.ts](src/components/shows/shows.ts) and [src/components/songs/songs.ts](src/components/songs/songs.ts), shaped by [src/models/gig.ts](src/models/gig.ts) and [src/models/song.ts](src/models/song.ts).
- Static media is under `public/images/` and should be referenced with root-relative paths such as `/images/home/...`.
- Shared social links belong in [src/utils/urls.ts](src/utils/urls.ts).

Use the established aliases from [tsconfig.json](tsconfig.json), including `@components`, `@models`, `@router`, `@styles`, `@utils`, and `@views`. Keep them synchronized with [vite.config.ts](vite.config.ts) if aliases change.

## Styling

Use the existing SCSS organization: global entry in [src/styles/index.scss](src/styles/index.scss), shared variables/layout partials in `src/styles/`, and component or view partials in `src/styles/components/` and `src/styles/views/`. Templates primarily use PrimeFlex utilities alongside the project’s existing BEM-like class names. Preserve the configured Prettier style in [.prettierrc](.prettierrc).

## Data And Behavior Notes

- Rendered images use Netlify Image CDN URLs built with `netlifyImage(src, width, format)` from [src/utils/images.ts](src/utils/images.ts); keep original source paths in static data and transform only at render time.
- Run `yarn netlify` (not `yarn dev`) for local development — plain Vite dev cannot resolve `/.netlify/images` URLs.
- The home hero preloads in [index.html](index.html) are injected by an inline script on home routes only; keep those URLs in sync with the hero srcset in [src/router/views/home.vue](src/router/views/home.vue).
- New show or song records should preserve the existing object shape, use unique IDs where applicable, and include matching files in `public/images/`.
- `show-card.vue` renders show descriptions with `v-html`; only trusted, intentionally authored HTML should enter `Gig.text`.
- Show filtering parses human-readable date strings in `src/router/views/shows.vue`; preserve the parseable format when adding dates.
- `songs-container.vue` sorts nested song arrays in place; avoid relying on imported source data remaining untouched when changing that behavior.
- The contact form appears intended for static-host or Netlify form handling, so verify deployment behavior before changing its submission markup.

Keep changes focused, follow existing Vue/TypeScript patterns, and avoid unrelated refactors.

