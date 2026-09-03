---
name: site-images
description: 'Use when adding, changing, reviewing, or optimizing images on the Lies From Granny Vue/Vite site, including Netlify Image CDN delivery, responsive image sizing, static asset paths, alt text, home heroes, show flyers, and inline photos.'
user-invocable: false
---

# Lies From Granny Site Images

Use this skill whenever a change adds, updates, reviews, or renders an image.

## Asset Paths

- Keep source assets in `public/images/` and use root-relative source paths such as `/images/home/lies-from-granny.jpg` or `/images/shows/2025/pickles-oc-8-2025.jpg`.
- Keep home, contact, songs, and show assets in their existing folders. Place show flyers in a year subdirectory when that pattern is already used.
- Confirm the source asset exists before referencing it.
- Store the original source path in static data such as `src/components/shows/shows.ts`; transform only the rendered image URL.
- Reuse an existing relevant image before adding an unrelated visual asset.

## Netlify Image CDN

- Use Netlify Image CDN URLs for rendered images. Build them from the original source path, for example `/.netlify/images?url=/images/shows/2025/example.jpg&w=400&fm=webp`.
- Add or reuse a focused image URL helper rather than duplicating transform URL construction across components.
- Choose transform widths from the rendered slot, not the source dimensions:
  - Desktop home hero: `1200`.
  - Mobile home hero: `500`.
  - Show-card flyers and round home route images: `400` or `800`, based on their rendered size.
  - Inline content images: roughly twice their intended display width.
- Use responsive `srcset` and `sizes` for images that have meaningfully different display widths across viewports.
- CSS background images cannot use `srcset`; use breakpoint-specific Netlify CDN URLs or `image-set()` when appropriate.
- Do not add a separate image optimization dependency when Netlify Image CDN is sufficient.

## Home Hero Preload

- The home hero is the LCP image, so its CDN URL is preloaded via an inline script in [index.html](../../../index.html), not a static `<link rel=preload>` — this SPA serves the same `index.html` for every route, so a static preload tag would fire on every landing page, not just home.
- The inline script gates on `window.location.pathname` and must stay at the top of `<head>`, before other `<link>`/`<script>` tags, so the preload link is inserted before the browser's preload scanner moves past it.
- Use `imagesrcset`/`imagesizes` attributes (not a single flat `href`) so the preload matches the responsive `srcset` actually requested by the rendered hero, and add one `<link>` per `media` breakpoint (mobile vs. desktop crop), mirroring `<picture><source media>`.
- Set `fetchpriority="high"` on these preload links.
- The preload URLs are hand-duplicated from the hero `srcset` in [home.vue](../../../src/router/views/home.vue) — there is no shared source of truth. Whenever the hero's CDN width/format/path changes in `home.vue`, update the matching preload URLs in `index.html` in the same change, or the preload silently stops matching and wastes bandwidth without helping LCP.

## Markup And Accessibility

- Write meaningful `alt` text for images conveying content. Use `alt=""` only for decorative imagery.
- Add explicit `width` and `height` to raw `img` elements to reserve layout space and prevent content shift.
- Use `object-fit: cover` only when cropping is intentional and the container has a stable aspect ratio or minimum height.
- Use `fetchpriority="high"` only on the first viewport's primary image, normally the home hero.
- Set `loading="lazy"` and `decoding="async"` on supporting images, particularly show archive cards. Do not lazy-load the primary above-the-fold image.

## Procedure

1. Identify the rendered slot, its display dimensions, whether it appears above the fold, and whether it conveys content.
2. Confirm the source file exists under `public/images/` and preserve its root-relative source path in data/configuration.
3. Generate the Netlify CDN URL through the shared helper at a width appropriate to the rendered slot.
4. Add stable image dimensions and appropriate loading, priority, and alternative-text attributes.
5. For layout changes, check a narrow mobile viewport and a desktop viewport for overflow, broken images, accidental cropping, and layout shift.
6. Run `yarn type-check` after changing Vue or TypeScript files. Run `yarn build` when changing delivery or deployment behavior.

## Review Checklist

- Is the image sourced from `public/images/` with the correct root-relative path?
- Does the rendered image use a Netlify CDN transform sized for its slot?
- Are below-the-fold/archive images lazy-loaded?
- Are width and height stable before load?
- Does the `alt` text explain meaningful visual content without repeating nearby text?
- Is only the above-the-fold primary image high priority?
- If the home hero's CDN URL, width, or format changed, was the matching preload in [index.html](../../../index.html) updated too?
