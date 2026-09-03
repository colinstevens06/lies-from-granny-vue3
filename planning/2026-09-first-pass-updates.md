# Priority Board

1. **Images and Netlify Image CDN.** Build the equivalent of the established image pattern: keep original `/images/...` paths in data, generate CDN URLs by rendered slot width, add explicit image dimensions, prioritize only the above-the-fold hero, and lazy-load supporting/archive media.
2. **Data updates.** Add the missing songs and shows so the repertoire and event archive are current before investing in new discovery or promotion UI.
3. **Heading structure (screen reader only).** Give each route its own `h1` and stop presenting every artist in the song list as an `h2`. Preserve the visible design unless a visual change is separately wanted.
4. **Song-list discovery.** Add search plus lightweight decade/genre filtering so visitors can quickly check whether a requested song is in the repertoire.
5. **Home-page primary action.** Feature the next show when one exists; otherwise lead with a concise booking action rather than leaving calls to action within the introductory copy.
6. **Shows archive.** Add year grouping, filtering, or collapse controls as the archive continues to grow.
7. **Remaining accessibility updates.** Label the mobile menu button, improve external-link handling, make the video title descriptive, and refine form labels/instructions.
8. **Contact-form workflow.** Treat end-to-end Netlify form configuration, validation, and confirmation feedback as the lowest current concern.

# UI/UX Review: First Pass

Reviewed September 3, 2026 across the home, shows, songs, contact, navigation, and shared layout flows. The site was rendered locally at desktop and mobile viewport sizes. No code changes were made during this review.

## Highest-Impact Improvements

### 1. Make Booking Reliably Complete

The contact form should provide a dependable route from interest to a confirmed inquiry.

- The form has no Netlify form-detection attribute, no success or error state, and no submission destination.
- The rendered inputs are not required and do not provide autocomplete hints.
- The 500-character limit only disables the submit button after the limit is exceeded; it does not enforce `maxlength` at the field.
- Add a visible page heading so visitors immediately understand they are on the booking/contact page.

Start in `src/router/views/contact.vue`.

### 2. Promote Upcoming Shows Into A Conversion Surface

The Shows page is the clearest path for a fan to take action, but it currently has no event-oriented action model.

- There are no upcoming events as of this review, so the page uses a text-only redirect to Instagram and Facebook.
- Show records cannot represent a venue address, start time, ticket link, event link, or a clear action such as Tickets or Directions.
- Add structured event fields and feature the next show prominently. When there are no upcoming shows, pair the social follow message with a more intentional email or social-follow call to action.

Start in `src/components/shows/shows.ts`, `src/router/views/shows.vue`, and `src/components/shows/show-card.vue`.

### 3. Give Each Page Its Own Primary Heading

The navigation brand is currently the only `h1`. Shows, Songs, and Contact start with an `h2` or introductory paragraph.

- Add an `h1` to each route for orientation, accessibility, and search semantics.
- Keep the navigation brand styled as the brand without making it the page heading.
- On the songs page, 74 band names are currently exposed as `h2`s. Use list or section semantics for artists instead.

Start in `src/components/layout/nav.vue`, `src/router/views/shows.vue`, `src/router/views/songs.vue`, `src/router/views/contact.vue`, and `src/components/songs/song-card.vue`.

### 4. Make The Song List Browsable

The song catalogue is valuable but difficult to scan: on mobile it becomes a single long list of 74 artists.

- Add artist/song search and lightweight decade or genre filters.
- Consider an alphabetical jump list or grouped letter sections.
- Preserve the straightforward full list as the default; the goal is fast discovery rather than hiding repertoire.

Start in `src/router/views/songs.vue`, `src/components/songs/songs-container.vue`, and `src/styles/components/_songs-list.scss`.

### 5. Clarify The Home Page's Primary Action

The hero image makes a strong first impression, but it does not communicate what a visitor should do next.

- When a future show exists, feature its date, venue, and a ticket/event action in or immediately below the hero.
- When there is no upcoming event, lead with a concise booking action and a secondary link to the song list or video.
- The current calls to action are embedded in longer introductory copy, followed by three visual route tiles.

Start in `src/router/views/home.vue`, `src/components/home/main-text.vue`, and `src/components/home/three-pack.vue`.

## Secondary Improvements

- Add an accessible label to the icon-only mobile menu button. Its rendered accessible name is currently the PrimeIcons glyph. `src/components/layout/nav.vue`
- Add `rel="noopener noreferrer"` consistently to external links in the Shows empty state. `src/router/views/shows.vue`
- Give the video a descriptive title and switch its fixed dimensions to an aspect-ratio-based responsive container. `src/components/home/home-video.vue` and `src/styles/components/_home.scss`
- The shows archive has 22 image-heavy cards without filtering, year grouping, or lazy image loading. Add a year filter/collapse pattern as the archive grows. `src/components/shows/show-card.vue` and `src/styles/components/_shows.scss`

## Image Delivery: Identified Aside

Image delivery is a known improvement item and should be handled separately from the interaction and information-architecture work above.

- Current references are direct origin-relative paths such as `/images/home/lies-from-granny.jpg`; no reusable Netlify Image CDN transform pattern was found in the source.
- The desktop home hero is `1800x895` and approximately `2.1 MB`, making it the first optimization target.
- Show-card images load eagerly, including those below the fold.
- Introduce a central image URL helper that produces Netlify Image CDN URLs, for example `/.netlify/images?url=/images/...&w=...&fm=webp`.
- Use `srcset` and `sizes` for content images, native `loading="lazy"` for below-the-fold images, and retain an appropriate fallback path.
- CSS background images will need responsive image-set or breakpoint-specific CDN URLs because they cannot use `srcset`.

Start in `src/styles/components/_home.scss` and `src/components/shows/show-card.vue`.

## Suggested Order

1. Make the contact form work end to end, including its confirmation state.
2. Add page-level heading structure and fix the mobile menu label.
3. Expand the show data model and build the upcoming-show/empty-state experience.
4. Improve song-list discovery and archive browsing.
5. Implement Netlify Image CDN delivery and lazy/responsive loading.

